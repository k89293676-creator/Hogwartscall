import { useState, useEffect, useRef } from 'react';
import type { Results } from '@mediapipe/hands';

export interface UseGestureReturn {
  landmarks: any[] | null;
  currentGesture: string | null;
}

export function detectGesture(marks: any[], prevWristXRef?: { current: number | null }): string | null {
  const isUp = (tip: number, pip: number) => marks[tip].y < marks[pip].y - 0.02;

  const thumbExt = Math.abs(marks[4].x - marks[2].x) > 0.04;
  const indexExt  = isUp(8,  6);
  const middleExt = isUp(12, 10);
  const ringExt   = isUp(16, 14);
  const pinkyExt  = isUp(20, 18);

  // Nox – thumb tip close to index tip
  const thumbToIndex = Math.sqrt(
    Math.pow(marks[4].x - marks[8].x, 2) + Math.pow(marks[4].y - marks[8].y, 2)
  );
  if (thumbToIndex < 0.05) return 'nox';

  // Alohomora – all fingers extended AND spread wide
  if (indexExt && middleExt && ringExt && pinkyExt) {
    const avgXSpread = (
      Math.abs(marks[8].x - marks[12].x) +
      Math.abs(marks[12].x - marks[16].x) +
      Math.abs(marks[16].x - marks[20].x)
    ) / 3;
    if (avgXSpread > 0.06) return 'alohomora';
    return 'lumos';
  }

  // Incendio – fist
  if (!indexExt && !middleExt && !ringExt && !pinkyExt && !thumbExt) return 'incendio';

  // Riddikulus – index + middle only, separated
  if (!thumbExt && indexExt && middleExt && !ringExt && !pinkyExt) {
    if (Math.abs(marks[8].x - marks[12].x) > 0.04) return 'riddikulus';
    return 'patronus';
  }

  // Expecto Patronum – crossed wrists detection
  if (prevWristXRef) {
    const currentWristX = marks[0].x;
    const baseX = marks[5].x;
    const prev = prevWristXRef.current;
    prevWristXRef.current = currentWristX;
    if (prev !== null && ((prev > baseX && currentWristX < baseX) || (prev < baseX && currentWristX > baseX))) {
      return 'expecto';
    }
  }

  // Expelliarmus – pointing index only
  if (!thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) return 'expelliarmus';

  // Stupefy – index + middle + ring
  if (!thumbExt && indexExt && middleExt && ringExt && !pinkyExt) return 'stupefy';

  // Protego – rock horns
  if (!thumbExt && indexExt && !middleExt && !ringExt && pinkyExt) return 'protego';

  // Wingardium Leviosa – L-shape
  if (thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) return 'wingardium';

  // Accio – shaka
  if (thumbExt && !indexExt && !middleExt && !ringExt && pinkyExt) return 'accio';

  return null;
}

export function useGesture(stream: MediaStream | null): UseGestureReturn {
  const [landmarks, setLandmarks] = useState<any[] | null>(null);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const gestureHoldRef = useRef<string | null>(null);
  const gestureHoldCountRef = useRef<number>(0);
  const gestureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevWristXRef = useRef<number | null>(null);
  const HOLD_FRAMES = 4;

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
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.4,
        });

        hands.onResults((results: Results) => {
          if (!isMounted) return;
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const marks = results.multiHandLandmarks[0];
            setLandmarks(marks);
            const detected = detectGesture(marks, prevWristXRef);

            if (detected) {
              if (detected === gestureHoldRef.current) {
                gestureHoldCountRef.current++;
              } else {
                gestureHoldRef.current = detected;
                gestureHoldCountRef.current = 1;
              }
              if (gestureHoldCountRef.current >= HOLD_FRAMES) {
                if (gestureTimeoutRef.current) { clearTimeout(gestureTimeoutRef.current); gestureTimeoutRef.current = null; }
                setCurrentGesture(detected);
              }
            } else {
              gestureHoldRef.current = null;
              gestureHoldCountRef.current = 0;
              if (!gestureTimeoutRef.current) {
                gestureTimeoutRef.current = setTimeout(() => { setCurrentGesture(null); gestureTimeoutRef.current = null; }, 400);
              }
            }
          } else {
            setLandmarks(null);
            gestureHoldRef.current = null;
            gestureHoldCountRef.current = 0;
            if (gestureTimeoutRef.current) clearTimeout(gestureTimeoutRef.current);
            gestureTimeoutRef.current = setTimeout(() => { setCurrentGesture(null); gestureTimeoutRef.current = null; }, 600);
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
