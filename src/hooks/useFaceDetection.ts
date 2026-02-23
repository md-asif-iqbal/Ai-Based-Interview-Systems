"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface FaceDetectionResult {
  faceCount: number;
  isLookingAway: boolean;
  hasMultipleFaces: boolean;
  noFaceDetected: boolean;
}

export function useFaceDetection(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [lastResult, setLastResult] = useState<FaceDetectionResult>({
    faceCount: 1,
    isLookingAway: false,
    hasMultipleFaces: false,
    noFaceDetected: false,
  });
  const [noFaceFrames, setNoFaceFrames] = useState(0);
  const [multipleFaceFrames, setMultipleFaceFrames] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars

  // Simple brightness/motion-based face detection heuristic
  // In production, you'd use TensorFlow.js face-api or MediaPipe
  const detectFaces = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx || video.videoWidth === 0) return;

    canvas.width = 160;
    canvas.height = 120;
    ctx.drawImage(video, 0, 0, 160, 120);

    const imageData = ctx.getImageData(0, 0, 160, 120);
    const data = imageData.data;

    // Calculate center region brightness (face area heuristic)
    let centerBrightness = 0;
    let centerPixels = 0;
    let edgeBrightness = 0;
    let edgePixels = 0;

    for (let y = 0; y < 120; y++) {
      for (let x = 0; x < 160; x++) {
        const idx = (y * 160 + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

        // Center region (face area)
        if (x >= 40 && x <= 120 && y >= 15 && y <= 90) {
          centerBrightness += brightness;
          centerPixels++;
        } else {
          edgeBrightness += brightness;
          edgePixels++;
        }
      }
    }

    const avgCenter = centerPixels > 0 ? centerBrightness / centerPixels : 0;
    const avgEdge = edgePixels > 0 ? edgeBrightness / edgePixels : 0;

    // Heuristic: if center is significantly brighter than edges, likely a face
    const hasFace = avgCenter > 30 && Math.abs(avgCenter - avgEdge) > 5;

    const result: FaceDetectionResult = {
      faceCount: hasFace ? 1 : 0,
      isLookingAway: false,
      hasMultipleFaces: false,
      noFaceDetected: !hasFace,
    };

    setLastResult(result);

    if (!hasFace) {
      setNoFaceFrames((prev) => prev + 1);
    } else {
      setNoFaceFrames(0);
    }
  }, [videoRef]);

  const start = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    setIsActive(true);
    intervalRef.current = setInterval(detectFaces, 2000); // Check every 2 seconds
  }, [detectFaces]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    isActive,
    lastResult,
    noFaceFrames,
    multipleFaceFrames,
    start,
    stop,
  };
}
