import { useState, useEffect, useRef } from 'react';
import type { Results } from '@mediapipe/hands';

export interface UseGestureReturn {
  landmarks: any[] | null;
  currentGesture: string | null;
}

export function useGesture(stream: MediaStream | null): UseGestureReturn {
  const [landmarks, setLandmarks] = useState<any[] | null>(null);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!stream) return;

    let isMounted = true;
    
    const initMediaPipe = async () => {
      if (!videoRef.current) {
        videoRef.current = document.createElement('video');
        videoRef.current.style.display = 'none';
        videoRef.current.autoplay = true;
        videoRef.current.playsInline = true;
        document.body.appendChild(videoRef.current);
      }
      
      videoRef.current.srcObject = stream;
      
      try {
        const { Hands } = await import('@mediapipe/hands');
        const { Camera } = await import('@mediapipe/camera_utils');
        
        if (!isMounted) return;

        const hands = new Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
        });
        
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5
        });
        
        hands.onResults((results: Results) => {
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const marks = results.multiHandLandmarks[0];
            setLandmarks(marks);
            detectGesture(marks);
          } else {
            setLandmarks(null);
            setCurrentGesture(null);
          }
        });
        
        handsRef.current = hands;
        
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && handsRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });
        
        camera.start();
        cameraRef.current = camera;
        
      } catch (err) {
        console.error('Error initializing MediaPipe:', err);
      }
    };
    
    initMediaPipe();
    
    return () => {
      isMounted = false;
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        if (document.body.contains(videoRef.current)) {
          document.body.removeChild(videoRef.current);
        }
      }
    };
  }, [stream]);

  const detectGesture = (marks: any[]) => {
    // MediaPipe Hands landmarks:
    // 0: wrist
    // 1-4: thumb (tip is 4)
    // 5-8: index (tip is 8)
    // 9-12: middle (tip is 12)
    // 13-16: ring (tip is 16)
    // 17-20: pinky (tip is 20)
    
    // Y-coordinate goes DOWN, so smaller Y means HIGHER
    const isExtended = (tip: number, pip: number) => marks[tip].y < marks[pip].y;
    
    // Check which fingers are extended
    const thumbExt = isExtended(4, 3) || marks[4].x > marks[3].x; // thumb can be sideways
    const indexExt = isExtended(8, 6);
    const middleExt = isExtended(12, 10);
    const ringExt = isExtended(16, 14);
    const pinkyExt = isExtended(20, 18);
    
    let detected = null;
    
    if (thumbExt && indexExt && middleExt && ringExt && pinkyExt) {
      detected = 'lumos'; // Open palm
    } else if (!thumbExt && !indexExt && !middleExt && !ringExt && !pinkyExt) {
      detected = 'incendio'; // Fist
    } else if (!thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) {
      detected = 'expelliarmus'; // Pointing index
    } else if (thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) {
      detected = 'wingardium'; // L-shape
    }
    
    if (detected) {
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
      }
      setCurrentGesture(detected);
    } else {
      // Debounce nulls
      if (!gestureTimeoutRef.current) {
        gestureTimeoutRef.current = setTimeout(() => {
          setCurrentGesture(null);
          gestureTimeoutRef.current = null;
        }, 300);
      }
    }
  };

  return { landmarks, currentGesture };
}
