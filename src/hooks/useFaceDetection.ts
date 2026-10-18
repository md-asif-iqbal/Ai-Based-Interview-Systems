"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export interface FaceDetectionResult {
  faceCount: number;
  isLookingAway: boolean;
  hasMultipleFaces: boolean;
  noFaceDetected: boolean;
  gazeStatus: "focused" | "looking_away" | "no_face";
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
    gazeStatus: "focused",
  });
  const [noFaceFrames, setNoFaceFrames] = useState(0);
  const [lookingAwayFrames, setLookingAwayFrames] = useState(0);
  const [multipleFaceFrames, setMultipleFaceFrames] = useState(0);

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

    let centerBrightness = 0;
    let centerPixels = 0;
    let edgeBrightness = 0;
    let edgePixels = 0;

    let leftFaceBrightness = 0;
    let leftFacePixels = 0;
    let rightFaceBrightness = 0;
    let rightFacePixels = 0;

    for (let y = 0; y < 120; y++) {
      for (let x = 0; x < 160; x++) {
        const idx = (y * 160 + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

        // Center region (face area)
        if (x >= 40 && x <= 120 && y >= 15 && y <= 95) {
          centerBrightness += brightness;
          centerPixels++;

          if (x < 80) {
            leftFaceBrightness += brightness;
            leftFacePixels++;
          } else {
            rightFaceBrightness += brightness;
            rightFacePixels++;
          }
        } else {
          edgeBrightness += brightness;
          edgePixels++;
        }
      }
    }

    const avgCenter = centerPixels > 0 ? centerBrightness / centerPixels : 0;
    const avgEdge = edgePixels > 0 ? edgeBrightness / edgePixels : 0;
    const avgLeft = leftFacePixels > 0 ? leftFaceBrightness / leftFacePixels : 0;
    const avgRight = rightFacePixels > 0 ? rightFaceBrightness / rightFacePixels : 0;

    // Face presence heuristic
    const hasFace = avgCenter > 28 && Math.abs(avgCenter - avgEdge) > 4;

    // Gaze alignment / Looking away heuristic:
    // If head turns strongly to side, lighting asymmetry across face exceeds 25%
    const faceAsymmetry = Math.abs(avgLeft - avgRight) / (Math.max(avgLeft, avgRight, 1));
    const isLookingAway = hasFace && faceAsymmetry > 0.32;

    let gazeStatus: "focused" | "looking_away" | "no_face" = "focused";
    if (!hasFace) {
      gazeStatus = "no_face";
    } else if (isLookingAway) {
      gazeStatus = "looking_away";
    }

    const result: FaceDetectionResult = {
      faceCount: hasFace ? 1 : 0,
      isLookingAway,
      hasMultipleFaces: false,
      noFaceDetected: !hasFace,
      gazeStatus,
    };

    setLastResult(result);

    if (!hasFace) {
      setNoFaceFrames((prev) => prev + 1);
    } else {
      setNoFaceFrames(0);
    }

    if (isLookingAway) {
      setLookingAwayFrames((prev) => prev + 1);
    } else {
      setLookingAwayFrames(0);
    }
  }, [videoRef]);

  const start = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    setIsActive(true);
    intervalRef.current = setInterval(detectFaces, 1500); // Check every 1.5s for fast focus detection
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
    lookingAwayFrames,
    multipleFaceFrames,
    start,
    stop,
  };
}
