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
  const gestureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const detectGesture = (marks: any[]): string | null => {
    // Y-coordinate increases downward, so tip.y < pip.y means finger is pointing up (extended)
    const isUp = (tip: number, pip: number) => marks[tip].y < marks[pip].y;

    const thumbExt = marks[4].x < marks[3].x || marks[4].x > marks[3].x
      ? Math.abs(marks[4].x - marks[2].x) > 0.04
      : isUp(4, 3);
    const indexExt  = isUp(8,  6);
    const middleExt = isUp(12, 10);
    const ringExt   = isUp(16, 14);
    const pinkyExt  = isUp(20, 18);

    // Lumos – open palm: all fingers extended
    if (thumbExt && indexExt && middleExt && ringExt && pinkyExt) return 'lumos';

    // Incendio – fist: no fingers extended
    if (!indexExt && !middleExt && !ringExt && !pinkyExt) return 'incendio';

    // Patronus – peace / V sign: index + middle only
    if (!thumbExt && indexExt && middleExt && !ringExt && !pinkyExt) return 'patronus';

    // Expelliarmus – pointing: only index extended
    if (!thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) return 'expelliarmus';

    // Wingardium Leviosa – L-shape: thumb + index, others curled
    if (thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) return 'wingardium';

    // Stupefy – three fingers: index + middle + ring
    if (!thumbExt && indexExt && middleExt && ringExt && !pinkyExt) return 'stupefy';

    // Protego – rock/metal horns: index + pinky (devil horns)
    if (!thumbExt && indexExt && !middleExt && !ringExt && pinkyExt) return 'protego';

    // Accio – shaka / hang-loose: thumb + pinky only
    if (thumbExt && !indexExt && !middleExt && !ringExt && pinkyExt) return 'accio';

    return null;
  };

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
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: Results) => {
          if (!isMounted) return;
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const marks = results.multiHandLandmarks[0];
            setLandmarks(marks);

            const detected = detectGesture(marks);

            if (detected) {
              if (gestureTimeoutRef.current) {
                clearTimeout(gestureTimeoutRef.current);
                gestureTimeoutRef.current = null;
              }
              setCurrentGesture(detected);
            } else {
              if (!gestureTimeoutRef.current) {
                gestureTimeoutRef.current = setTimeout(() => {
                  setCurrentGesture(null);
                  gestureTimeoutRef.current = null;
                }, 300);
              }
            }
          } else {
            setLandmarks(null);
            if (gestureTimeoutRef.current) clearTimeout(gestureTimeoutRef.current);
            gestureTimeoutRef.current = setTimeout(() => {
              setCurrentGesture(null);
              gestureTimeoutRef.current = null;
            }, 500);
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
          height: 480,
        });

        camera.start();
        cameraRef.current = camera;
      } catch (err) {
        console.error('MediaPipe initialization failed:', err);
      }
    };

    initMediaPipe();

    return () => {
      isMounted = false;
      if (gestureTimeoutRef.current) clearTimeout(gestureTimeoutRef.current);
      cameraRef.current?.stop();
      handsRef.current?.close();
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        if (document.body.contains(videoRef.current)) document.body.removeChild(videoRef.current);
        videoRef.current = null;
      }
    };
  }, [stream]);

  return { landmarks, currentGesture };
}
