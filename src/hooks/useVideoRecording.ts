"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export function useVideoRecording() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      console.log("📹 Requesting camera and microphone access...");
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support camera access");
      }

      // Check permission state first (if supported) to detect denied
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const camPerm = await navigator.permissions.query({ name: "camera" as PermissionName });
          const micPerm = await navigator.permissions.query({ name: "microphone" as PermissionName });
          console.log("📹 Camera permission:", camPerm.state, "| Mic permission:", micPerm.state);
        } catch {
          // permissions.query not supported for camera/mic on some browsers — fine
        }
      }

      let stream: MediaStream | null = null;

      // Try with ideal constraints first
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user" 
          },
          audio: true,
        });
      } catch (firstErr: unknown) {
        const errName = (firstErr as { name?: string })?.name;
        console.warn("⚠️ HD camera failed, trying lower resolution...", errName);

        // Fallback: simpler constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
            audio: true,
          });
        } catch (secondErr: unknown) {
          const err2Name = (secondErr as { name?: string })?.name;
          console.warn("⚠️ Low-res camera failed, trying bare minimum...", err2Name);

          // Final fallback: just video: true, audio: true
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          } catch (thirdErr: unknown) {
            const err3Name = (thirdErr as { name?: string })?.name;
            console.warn("⚠️ Video+audio failed, trying audio only...", err3Name);

            // Last resort: audio only (some devices may not have a camera at all)
            try {
              stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            } catch {
              // Everything failed — throw the original error
              throw firstErr;
            }
          }
        }
      }

      if (!stream) {
        throw new Error("Could not access camera or microphone");
      }
      
      console.log("✅ Got media stream:", stream.getTracks().map(t => `${t.kind}:${t.enabled}`));
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("✅ Video element srcObject set");
        
        // Force video to play
        try {
          await videoRef.current.play();
          console.log("✅ Video playing");
        } catch (playErr) {
          console.log("ℹ️ Video play error (may be ok):", playErr);
        }
        
        // Wait for video to load
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log("✅ Video metadata loaded");
              resolve(true);
            };
            // Fallback timeout
            setTimeout(resolve, 1000);
          } else {
            resolve(true);
          }
        });
      }
      
      setHasPermission(true);
      setError(null);
      console.log("✅ Camera fully initialized");
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      console.error("❌ Camera access error:", error.name, error.message);
      let errorMessage = "";
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage = "Camera/Microphone blocked! To fix:\n1. Click the 🔒 lock icon in your browser address bar\n2. Set Camera and Microphone to 'Allow'\n3. Reload the page";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage = "No camera or microphone found. Please connect a device and try again.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage = "Camera is being used by another app. Please close other apps using the camera and try again.";
      } else if (error.name === "OverconstrainedError") {
        errorMessage = "Camera does not support the required settings. Trying with basic settings...";
      } else if (error.name === "AbortError") {
        errorMessage = "Camera access was interrupted. Please try again.";
      } else if (error.name === "SecurityError") {
        errorMessage = "Camera access requires HTTPS. Please use https:// or localhost.";
      } else {
        errorMessage = "Could not access camera: " + (error.message || "Unknown error");
      }
      
      setError(errorMessage);
      setHasPermission(false);
      throw new Error(errorMessage);
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    // Find a supported mimeType — Safari doesn't support webm
    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4",
      "",  // browser default
    ];
    let options: MediaRecorderOptions = {};
    for (const mime of mimeTypes) {
      if (!mime || (typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(mime))) {
        if (mime) options = { mimeType: mime };
        break;
      }
    }

    try {
      const mr = new MediaRecorder(streamRef.current, options);
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.start(1000);
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      console.log("✅ Recording started with mimeType:", mr.mimeType);
    } catch (err) {
      console.warn("⚠️ MediaRecorder failed, recording skipped:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setHasPermission(false);
  }, []);

  const getRecordingBlob = useCallback(() => {
    if (chunksRef.current.length === 0) return null;
    return new Blob(chunksRef.current, { type: "video/webm" });
  }, []);

  const captureSnapshot = useCallback((): string | null => {
    if (!videoRef.current) return null;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.7);
  }, []);

  // Keep stream alive when tab loses visibility — do NOT stop camera on hide
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) return;
      // Reconnect video element if stream exists but srcObject was cleared
      if (streamRef.current && videoRef.current && !videoRef.current.srcObject) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
      // Re-enable any tracks that got muted/disabled by the browser
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => {
          if (!t.enabled) t.enabled = true;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Heartbeat: every 5s check if video element lost srcObject and reconnect
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        streamRef.current &&
        streamRef.current.active &&
        videoRef.current &&
        !videoRef.current.srcObject
      ) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
      stopCamera();
    };
  }, [stopRecording, stopCamera]);

  return {
    videoRef,
    streamRef,
    isRecording,
    hasPermission,
    error,
    startCamera,
    startRecording,
    stopRecording,
    stopCamera,
    getRecordingBlob,
    captureSnapshot,
  };
}
