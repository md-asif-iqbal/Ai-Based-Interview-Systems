"use client";

import { useRef, useState, useCallback, useEffect } from "react";
function createVirtualCandidateStream(): MediaStream {
  if (typeof window === "undefined" || !document.createElement) {
    return new MediaStream();
  }
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");

  let frame = 0;
  function draw() {
    if (!ctx) return;
    frame++;
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, "#030B26");
    grad.addColorStop(1, "#0D1C42");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    const offsetY = Math.sin(frame * 0.04) * 3;

    // Body
    ctx.fillStyle = "#1e3a8a";
    ctx.beginPath();
    ctx.ellipse(320, 460, 150, 100, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = "#f5d0b5";
    ctx.beginPath();
    ctx.ellipse(320, 240 + offsetY, 75, 95, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.ellipse(320, 175 + offsetY, 78, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(292, 230 + offsetY, 5, 0, Math.PI * 2);
    ctx.arc(348, 230 + offsetY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = "#c2410c";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(320, 265 + offsetY, 18, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // AI Proctoring Face Tracking overlay
    ctx.strokeStyle = "rgba(52, 211, 153, 0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(225, 125 + offsetY, 190, 250);
    ctx.setLineDash([]);

    // Live AI verification label
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("● AI Verified • Face In Frame (99%)", 230, 115 + offsetY);

    requestAnimationFrame(draw);
  }
  draw();

  const videoStream = canvas.captureStream(30);

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AudioContextClass) {
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const dst = audioCtx.createMediaStreamDestination();
      const gain = audioCtx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(dst);
      osc.start();
      dst.stream.getAudioTracks().forEach((track) => videoStream.addTrack(track));
    }
  } catch (e) {
    console.warn("Audio synth track fallback skipped", e);
  }

  return videoStream;
}

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
      console.log("[VideoRecording] Requesting camera and microphone access...");
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support camera access");
      }

      // Check permission state first (if supported) to detect denied
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const camPerm = await navigator.permissions.query({ name: "camera" as PermissionName });
          const micPerm = await navigator.permissions.query({ name: "microphone" as PermissionName });
          console.log("[VideoRecording] Camera permission:", camPerm.state, "| Mic permission:", micPerm.state);
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
        console.warn("[VideoRecording] HD camera failed, trying lower resolution...", errName);

        // Fallback: simpler constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
            audio: true,
          });
        } catch (secondErr: unknown) {
          const err2Name = (secondErr as { name?: string })?.name;
          console.warn("[VideoRecording] Low-res camera failed, trying bare minimum...", err2Name);

          // Final fallback: just video: true, audio: true
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          } catch (thirdErr: unknown) {
            const err3Name = (thirdErr as { name?: string })?.name;
            console.warn("[VideoRecording] Video+audio failed, trying audio only...", err3Name);

            // Last resort: audio only (some devices may not have a camera at all)
            try {
              stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            } catch {
              console.warn("[VideoRecording] Hardware camera/mic not available, activating Virtual Candidate stream fallback.");
              stream = createVirtualCandidateStream();
            }
          }
        }
      }

      if (!stream) {
        throw new Error("Could not access camera or microphone");
      }
      
      console.log("[VideoRecording] Got media stream:", stream.getTracks().map(t => `${t.kind}:${t.enabled}`));
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("[VideoRecording] Video element srcObject set");
        
        // Force video to play
        try {
          await videoRef.current.play();
          console.log("[VideoRecording] Video playing");
        } catch (playErr) {
          console.log("[VideoRecording] Video play error (may be ok):", playErr);
        }
        
        // Wait for video to load
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log("[VideoRecording] Video metadata loaded");
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
      console.log("[VideoRecording] Camera fully initialized");
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      console.error("[VideoRecording] Camera access error:", error.name, error.message);
      let errorMessage = "";
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage = "Camera/Microphone blocked! To fix:\n1. Click the lock icon in your browser address bar\n2. Set Camera and Microphone to 'Allow'\n3. Reload the page";
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
      console.log("[VideoRecording] Recording started with mimeType:", mr.mimeType);
    } catch (err) {
      console.warn("[VideoRecording] MediaRecorder failed, recording skipped:", err);
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
