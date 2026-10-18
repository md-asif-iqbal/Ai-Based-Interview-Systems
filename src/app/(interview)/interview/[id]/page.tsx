"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Shield,
  Clock,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Volume2,
  ChevronRight,
  Camera,
  SkipForward,
  Code2,
  Target,
  FileText,
  Languages,
  EyeOff,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useInterviewStore } from "@/store/interviewStore";
import { useVideoRecording } from "@/hooks/useVideoRecording";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { useFullScreenEnforcement } from "@/hooks/useFullScreenEnforcement";
import { useTabSwitchDetection } from "@/hooks/useTabSwitchDetection";
import { useViolationLogger } from "@/hooks/useViolationLogger";
import ViolationWarningModal from "@/components/interview/ViolationWarningModal";
import ScoreReaction from "@/components/interview/ScoreReaction";
import { playTabSwitchWarningSound, playCameraFocusWarningSound } from "@/lib/audio/warningSound";

const MAX_WARNINGS = 10;

/* ─── Helper: speak text via Web Speech API ─── */
function aiSpeak(text: string, onEnd?: () => void): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  // Deep, soft, warm interviewer voice
  utter.rate = 0.82;   // slightly slower — calm, unhurried
  utter.pitch = 0.88;  // lower pitch — deeper, more professional
  utter.volume = 1.0;
  utter.lang = "en-US";

  // Wait for voices to load (Chrome async)
  const assignVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    // Priority: warm natural female/male voices — avoid robotic "Google" synth
    const voice =
      voices.find((v) => v.lang.startsWith("en") && v.name.includes("Samantha")) ||
      voices.find((v) => v.lang.startsWith("en") && v.name.includes("Karen")) ||
      voices.find((v) => v.lang.startsWith("en") && v.name.includes("Daniel")) ||
      voices.find((v) => v.lang.startsWith("en") && v.name.includes("Moira")) ||
      voices.find((v) => v.lang.startsWith("en") && v.name.includes("Tessa")) ||
      voices.find((v) => v.lang.startsWith("en") && v.name.includes("Fiona")) ||
      voices.find((v) => v.name.includes("Microsoft Zira") && v.lang.startsWith("en")) ||
      voices.find((v) => v.name.includes("Microsoft David") && v.lang.startsWith("en")) ||
      voices.find((v) => v.name.includes("Google US English") && v.lang.startsWith("en")) ||
      voices.find((v) => v.lang === "en-US" && !v.localService) ||
      voices.find((v) => v.lang === "en-US") ||
      voices.find((v) => v.lang.startsWith("en"));
    if (voice) utter.voice = voice;
    if (onEnd) utter.onend = () => onEnd();
    utter.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utter);
    // Chrome keepalive workaround for long texts
    const ka = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else if (!window.speechSynthesis.speaking) {
        clearInterval(ka);
      }
    }, 10000);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    assignVoiceAndSpeak();
  } else {
    // Chrome loads voices async — wait for the event
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      assignVoiceAndSpeak();
    };
    // Fallback: speak without preferred voice after 300ms
    setTimeout(() => {
      if (!window.speechSynthesis.speaking) assignVoiceAndSpeak();
    }, 300);
  }
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* ═══════════════════════════════════════ */
/*  MAIN INTERVIEW PAGE                   */
/* ═══════════════════════════════════════ */
export default function InterviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const interviewId = id as string;

  // Store
  const store = useInterviewStore();

  // Hooks
  const video = useVideoRecording();
  const speech = useSpeechToText();
  const faceDetection = useFaceDetection(video.videoRef);
  const fullscreen = useFullScreenEnforcement();
  const tabSwitch = useTabSwitchDetection();
  const violationLogger = useViolationLogger(interviewId);

  // Phase state
  type Phase = "loading" | "ready" | "prep" | "intro" | "question" | "evaluating" | "completed" | "terminated";
  const [phase, setPhase] = useState<Phase>("loading");
  const [prepTime, setPrepTime] = useState(15);
  const [warningModal, setWarningModal] = useState({
    open: false,
    type: "",
    penalty: 5,
    isFirstWarning: false,
    nextPenaltyMarks: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [interviewDbStatus, setInterviewDbStatus] = useState("ready");
  const [evalProgress, setEvalProgress] = useState(0);
  const [faceWarning, setFaceWarning] = useState(false);
  const [penaltyPoints, setPenaltyPoints] = useState(0);

  // Refs
  const questionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSubmitRef = useRef(false);
  const sidebarVideoRef = useRef<HTMLVideoElement>(null);
  const lastViolationTimeRef = useRef(0);
  const violationCountRef = useRef(0);

  // Sync all video elements whenever stream becomes available OR phase changes
  useEffect(() => {
    const stream = video.streamRef?.current;
    if (!stream) return;
    // videoRef — used in ready screen and prep screen
    if (video.videoRef.current && video.videoRef.current.srcObject !== stream) {
      video.videoRef.current.srcObject = stream;
      video.videoRef.current.play().catch(() => {});
    }
    // sidebarVideoRef — used in question phase sidebar (may not be mounted yet on ready)
    if (sidebarVideoRef.current && sidebarVideoRef.current.srcObject !== stream) {
      sidebarVideoRef.current.srcObject = stream;
      sidebarVideoRef.current.play().catch(() => {});
    }
  }, [video.hasPermission, video.streamRef, video.videoRef, phase]);

  /* ─── Fullscreen exit notification ─── */
  const prevFullscreenRef = useRef(true);
  useEffect(() => {
    if (phase !== "prep" && phase !== "intro" && phase !== "question") return;
    if (prevFullscreenRef.current && !fullscreen.isFullScreen) {
      toast.warning("Fullscreen exited! Please stay in fullscreen mode during the interview.", {
        duration: 4000,
      });
    }
    prevFullscreenRef.current = fullscreen.isFullScreen;
  }, [fullscreen.isFullScreen, phase]);

  /* ─── Violation handler (Alarm Sound + Grace 1st Warning, Marks Deduction on Repeat) ─── */
  const handleViolation = useCallback(
    (type: string, penalty: number = 5) => {
      const now = Date.now();
      // Cooldown to avoid duplicate triggers from simultaneously fired window events
      if (now - lastViolationTimeRef.current < 1500) {
        return;
      }
      lastViolationTimeRef.current = now;

      violationCountRef.current += 1;
      const isFirst = violationCountRef.current === 1;
      const actualPenalty = isFirst ? 0 : penalty;

      violationLogger.logViolation(type);
      store.incrementWarning();

      if (!isFirst) {
        setPenaltyPoints((p) => p + actualPenalty);
      }

      setWarningModal({
        open: true,
        type,
        penalty: actualPenalty,
        isFirstWarning: isFirst,
        nextPenaltyMarks: penalty,
      });

      // Trigger audible warning alarm
      if (type === "tab_switch" || type === "window_blur" || type === "fullscreen_exit") {
        playTabSwitchWarningSound();
      } else if (type === "looking_away" || type === "no_face") {
        playCameraFocusWarningSound();
      }

      if (isFirst) {
        toast.warning(
          `⚠️ First Warning: No marks deducted! Stay focused — next violation will deduct -${penalty} marks.`,
          { duration: 5500 }
        );
      } else {
        toast.error(
          `🚨 Security Alert: -${actualPenalty} marks deducted for ${type.replace("_", " ")}!`,
          { duration: 4500 }
        );
      }

      if (violationLogger.totalScore <= 0 || store.warningCount >= MAX_WARNINGS) {
        setPhase("terminated");
        toast.error("Interview terminated due to excessive security violations.");
        fetch(`/api/interviews/${interviewId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ terminated: true, penaltyPoints: penaltyPoints + actualPenalty }),
        });
      }
    },
    [violationLogger, store, interviewId, penaltyPoints]
  );

  /* ═══════════════════════════════════════ */
  /*  1. FETCH INTERVIEW ON MOUNT           */
  /* ═══════════════════════════════════════ */
  useEffect(() => {
    if (!interviewId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/interviews/${interviewId}`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.success) {
          toast.error("Failed to load interview");
          router.push("/dashboard");
          return;
        }
        const interview = json.data;
        const jobTitle =
          interview.applicationId?.jobId?.title || interview.job?.title || "Interview";

        store.setInterviewId(interviewId);
        store.setJobTitle(jobTitle);
        store.setQuestions(interview.questions || []);
        setInterviewDbStatus(interview.status);

        // Extract candidate name and company from populated data
        const candidateName =
          interview.applicationId?.candidateId?.parsedResume?.name ||
          interview.applicationId?.candidateId?.fullName ||
          "";
        const companyName =
          interview.applicationId?.jobId?.companyId?.name || "";
        if (candidateName) store.setCandidateName(candidateName);
        if (companyName) store.setCompanyName(companyName);

        const total = (interview.questions || []).length * 50;
        store.setTotalTimeRemaining(total);

        // Route to correct phase based on DB status
        if (interview.status === "completed" || interview.status === "terminated") {
          // Restore score + answers from DB so completed screen shows correctly
          if (interview.overallScore != null) store.setOverallScore(interview.overallScore);
          if (interview.aiRecommendation) store.setAiRecommendation(interview.aiRecommendation);
          // Restore per-answer evaluations
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (interview.answers || []).forEach((a: any) => {
            store.addAnswer({
              questionId: a._id || String(a.questionIndex),
              answer: a.answerText || "",
              timeSpent: a.duration || 0,
            });
            if (a.evaluation) {
              store.updateAnswer(a._id || String(a.questionIndex), {
                evaluation: {
                  score: a.evaluation.score ?? 0,
                  feedback: a.evaluation.feedback || "",
                  strengths: a.evaluation.keywordsFound || [],
                  improvements: a.evaluation.keywordsMissing || [],
                },
              });
            }
          });
          store.setStatus(interview.status === "completed" ? "completed" : "terminated");
          setPhase(interview.status === "completed" ? "completed" : "terminated");
          return;
        }

        store.setStatus("ready");
        setPhase("ready");
      } catch {
        if (!cancelled) {
          toast.error("Failed to load interview");
          router.push("/dashboard");
        }
      }
    })();
    return () => {
      cancelled = true;
      store.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  /* ═══════════════════════════════════════ */
  /*  2. PREPARATION COUNTDOWN              */
  /* ═══════════════════════════════════════ */

  /* ─── Auto-start camera when ready screen loads ─── */
  useEffect(() => {
    if (phase !== "ready") return;
    if (video.hasPermission) return; // already on
    video.startCamera().catch(() => {
      // ignore — user will be shown the "camera not available" overlay
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ─── Preparation countdown ─── */
  useEffect(() => {
    if (phase !== "prep") return;
    setPrepTime(15);
    prepTimerRef.current = setInterval(() => {
      setPrepTime((p) => {
        if (p <= 1) {
          if (prepTimerRef.current) clearInterval(prepTimerRef.current);
          setPhase("intro");
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    };
  }, [phase]);

  /* ═══════════════════════════════════════ */
  /*  3. AI INTRODUCTION                    */
  /* ═══════════════════════════════════════ */
  useEffect(() => {
    if (phase !== "intro") return;
    setAiSpeaking(true);
    const nameGreeting = store.candidateName
      ? (() => {
          // Extract a good first name — skip common prefixes like "MD.", "MR.", "MS."
          const parts = store.candidateName.trim().split(/\s+/);
          const skipPrefixes = ["md.", "md", "mr.", "mr", "ms.", "ms", "mrs.", "mrs", "dr.", "dr"];
          const firstName = parts.find((p) => !skipPrefixes.includes(p.toLowerCase())) || parts[0];
          return `Hello ${firstName}! `;
        })()
      : "Hello! ";
    const companyMention = store.companyName ? ` at ${store.companyName}` : "";
    const text = `${nameGreeting}Welcome to your AI Interview for the ${store.jobTitle} position${companyMention}. I am your AI interviewer. This interview has ${store.questions.length} questions. You will have 1 minute per question. Please answer by speaking clearly into your microphone. Let's begin with the first question.`;
    aiSpeak(text, () => {
      setAiSpeaking(false);
      setPhase("question");
    });
    // Safety fallback
    const fallback = setTimeout(() => {
      setAiSpeaking(false);
      if (phase === "intro") setPhase("question");
    }, 20000);
    return () => {
      clearTimeout(fallback);
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ═══════════════════════════════════════ */
  /*  4. QUESTION PHASE: TIMER + AI VOICE   */
  /* ═══════════════════════════════════════ */
  useEffect(() => {
    if (phase !== "question") return;

    const q = store.questions[store.currentQuestionIndex];
    if (!q) return;

    autoSubmitRef.current = false;

    // Answer time: always 50s per question (ignoring stale DB values)
    const limit = 50;
    let localTime = limit;
    let localTotal = useInterviewStore.getState().totalTimeRemaining;

    // Reset speech & timer display — but DON'T start timer yet
    speech.resetTranscript();
    store.setTimeRemaining(limit);

    // Speak the question first — timer starts only AFTER AI finishes
    setAiSpeaking(true);
    const questionText = q.questionText || q.question || "";
    const prefix = `Question ${store.currentQuestionIndex + 1}. `;

    const startTimerAndMic = () => {
      setAiSpeaking(false);
      // 800ms delay: lets speaker audio fade out so mic doesn't capture AI voice
      setTimeout(() => {
        if (!autoSubmitRef.current) {
          // Start mic
          if (speech.isSupported) {
            try { speech.startListening(); } catch { /* ignore */ }
          }
          // Start countdown timer ONLY after AI done speaking
          questionTimerRef.current = setInterval(() => {
            localTime = Math.max(0, localTime - 1);
            localTotal = Math.max(0, localTotal - 1);
            store.setTimeRemaining(localTime);
            store.setTotalTimeRemaining(localTotal);
            if (localTime === 0 && !autoSubmitRef.current) {
              autoSubmitRef.current = true;
              if (questionTimerRef.current) clearInterval(questionTimerRef.current);
              const currentTranscript = speech.transcript.trim();
              if (currentTranscript) {
                doSubmitAnswer(currentTranscript);
              } else {
                toast.info("Time's up! Moving to next question...");
                moveToNextOrComplete();
              }
            }
          }, 1000);
        }
      }, 800);
    };

    aiSpeak(prefix + questionText, startTimerAndMic);

    // Fallback: if TTS stalls for >20s, force-start timer+mic
    const speakFallback = setTimeout(() => {
      if (aiSpeaking) startTimerAndMic();
    }, 20000);

    return () => {
      clearTimeout(speakFallback);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      window.speechSynthesis?.cancel();
      try { speech.stopListening(); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, store.currentQuestionIndex]);

  /* ═══════════════════════════════════════ */
  /*  5. FACE / POSTURE DETECTION           */
  /* ═══════════════════════════════════════ */
  useEffect(() => {
    if (phase === "question" || phase === "prep") {
      faceDetection.start();
    } else {
      faceDetection.stop();
      setFaceWarning(false);
    }
    return () => faceDetection.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ─── Camera Eye Contact & Face Visibility Monitoring ─── */
  useEffect(() => {
    if (phase !== "question") return;

    // Face missing from frame for ~4.5 seconds
    if (faceDetection.noFaceFrames >= 3) {
      setFaceWarning(true);
      if (faceDetection.noFaceFrames === 3) {
        handleViolation("no_face", 3);
      }
    } else {
      setFaceWarning(false);
    }

    // Looking away from camera for ~3 seconds
    if (faceDetection.lookingAwayFrames === 2) {
      handleViolation("looking_away", 2);
    }
  }, [faceDetection.noFaceFrames, faceDetection.lookingAwayFrames, phase, handleViolation]);

  /* ─── Real-Time Tab Switch & Blur Audible Alarm Guard ─── */
  useEffect(() => {
    if (phase !== "question" && phase !== "prep" && phase !== "intro") return;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        playTabSwitchWarningSound();
        handleViolation("tab_switch", 5);
      }
    };

    const onBlur = () => {
      playTabSwitchWarningSound();
      handleViolation("window_blur", 5);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [phase, handleViolation]);

  /* ─── Move to next question or complete ─── */
  const moveToNextOrComplete = useCallback(() => {
    if (store.currentQuestionIndex < store.questions.length - 1) {
      store.nextQuestion();
    } else {
      doCompleteInterview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentQuestionIndex, store.questions.length]);

  /* ─── Submit Answer to API ─── */
  const doSubmitAnswer = async (answerText: string) => {
    if (submitting) return;
    setSubmitting(true);

    // Stop listening
    try {
      speech.stopListening();
    } catch {
      // ignore
    }

    try {
      const qi = store.currentQuestionIndex;
      const q = store.questions[qi];
      const timeSpent = (q?.timeLimit || q?.timeLimitSeconds || 50) - store.timeRemaining;

      const res = await fetch(`/api/interviews/${interviewId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionIndex: qi,
          answerText,
          duration: timeSpent,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        // Save to store (no per-question evaluation — happens at completion)
        store.addAnswer({
          questionId: q?._id || String(qi),
          answer: answerText,
          timeSpent,
        });

        toast.success(`Answer saved! ${json.data?.progress?.answered}/${json.data?.progress?.total}`);
        speech.resetTranscript();
        moveToNextOrComplete();
      } else {
        toast.error(json.error || "Failed to submit answer");
        speech.resetTranscript();
      }
    } catch {
      toast.error("Network error submitting answer");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Complete Interview ─── */
  const doCompleteInterview = async () => {
    try {
      video.stopRecording();
      // NOTE: stopCamera is called AFTER phase="completed" renders below
      fullscreen.disable();
      tabSwitch.disable();
      window.speechSynthesis?.cancel();

      // Show evaluating phase while AI evaluates all answers in batch
      setPhase("evaluating");
      setEvalProgress(0);

      // Simulate progress while waiting for batch evaluation
      const progressInterval = setInterval(() => {
        setEvalProgress((p) => {
          if (p >= 90) return 90; // Cap at 90 until done
          return p + Math.random() * 8;
        });
      }, 600);

      const res = await fetch(`/api/interviews/${interviewId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ terminated: false, penaltyPoints }),
      });
      const json = await res.json();

      clearInterval(progressInterval);
      setEvalProgress(100);

      // Small delay to show 100%
      await new Promise((r) => setTimeout(r, 500));

      store.setStatus("completed");
      const score = json.data?.overallScore;
      const rec = json.data?.aiRecommendation;
      const answerScores = json.data?.answerScores || [];
      if (score != null) store.setOverallScore(score);
      if (rec) store.setAiRecommendation(rec);

      // Update answers with evaluation scores from batch using proper store action
      for (const as of answerScores) {
        const targetAnswer = store.answers[as.questionIndex];
        if (targetAnswer) {
          store.updateAnswer(targetAnswer.questionId, {
            evaluation: {
              score: as.score,
              feedback: as.feedback || "",
              strengths: as.keywordsFound || [],
              improvements: as.keywordsMissing || [],
            },
          });
        }
      }

      setPhase("completed");
      // Now that results screen is shown, release camera
      video.stopCamera();

      // Speak detailed result with score and position fit
      const fitMap: Record<string, string> = {
        strong_hire: "Excellent! You are a very strong fit for this position. We highly recommend you.",
        hire: "Good job! You are a suitable fit for this position.",
        maybe: "Your performance was average. There are some areas that could be improved for this role.",
        no_hire: "Unfortunately, based on your responses, this position may not be the best match right now. Keep practicing!",
      };
      const fitText = fitMap[rec || ""] || "Your responses have been recorded and evaluated.";
      const scoreText = score != null ? `Your overall interview score is ${score} percent. ` : "";
      const thankName = store.candidateName
        ? (() => {
            const parts = store.candidateName.trim().split(/\s+/);
            const skipPrefixes = ["md.", "md", "mr.", "mr", "ms.", "ms", "mrs.", "mrs", "dr.", "dr"];
            const firstName = parts.find((p) => !skipPrefixes.includes(p.toLowerCase())) || parts[0];
            return `Thank you ${firstName}`;
          })()
        : "Thank you";
      aiSpeak(
        `${thankName} for completing the interview for the ${store.jobTitle} position. ${scoreText}${fitText} You may now return to your dashboard.`
      );
    } catch {
      toast.error("Failed to complete interview");
      setPhase("completed");
    }
  };

  /* ═══════════════════════════════════════ */
  /*  START INTERVIEW                       */
  /* ═══════════════════════════════════════ */
  const handleStart = async () => {
    // ═══ STEP 1: Get camera & mic — REQUIRED (must have both) ═══
    if (!video.hasPermission) {
      toast.info("Requesting camera & microphone access...", { duration: 3000 });
      try {
        await video.startCamera();
      } catch {
        // First attempt failed — retry
        toast.warning("Please click 'Allow' when your browser asks for Camera & Microphone access.", {
          duration: 6000,
        });
        await new Promise((r) => setTimeout(r, 2000));
        try {
          await video.startCamera();
        } catch {
          // BLOCK — both camera and mic are mandatory
          toast.error("Camera & Microphone are required for this interview. Please allow access and try again.", {
            duration: 8000,
          });
          return;
        }
      }
    }

    // Verify mic is available via speech recognition
    if (!speech.isSupported) {
      toast.warning("Microphone / Speech Recognition may be limited in this browser.");
    }

    // ═══ STEP 2: Warm up TTS — browser requires user gesture ═══
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.getVoices();
      const warmUp = new SpeechSynthesisUtterance(" ");
      warmUp.volume = 0.01;
      window.speechSynthesis.speak(warmUp);
    }

    // ═══ STEP 3: Call start API ═══
    if (interviewDbStatus !== "in_progress") {
      try {
        const res = await fetch(`/api/interviews/${interviewId}/start`, { method: "POST" });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          toast.error(d.error || "Failed to start");
          return;
        }
      } catch {
        toast.error("Failed to start interview");
        return;
      }
    }

    // ═══ STEP 4: Start recording (camera is confirmed available) ═══
    if (video.hasPermission) {
      video.startRecording();
    }

    // ═══ STEP 5: NOW enter fullscreen & enable security ═══
    // Delay slightly so all permissions are settled
    await new Promise((r) => setTimeout(r, 300));
    fullscreen.enable(handleViolation);
    tabSwitch.enable(handleViolation);

    store.setStatus("in_progress");
    store.setCameraActive(true);
    setPhase("prep");
    toast.success("Get ready! Interview starting soon...");
  };

  /* ─── Manual submit ─── */
  const handleManualSubmit = () => {
    const text = speech.transcript.trim();
    if (!text) {
      toast.error("Please speak your answer first.");
      return;
    }
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    doSubmitAnswer(text);
  };

  /* ═══════════════════════════════════════ */
  /*  COMPUTED VALUES                       */
  /* ═══════════════════════════════════════ */
  const currentQ = store.questions[store.currentQuestionIndex];
  const isLowTime = store.timeRemaining < 30;
  const categoryIcon: Record<string, React.ComponentType<{ className?: string }>> = {
    technical: Code2,
    behavioral: Brain,
    situational: Target,
  };
  const getScoreLabel = (score: number) => {
    if (score >= 75) return { label: "Correct", color: "text-green-500", bg: "bg-green-500/10" };
    if (score >= 40) return { label: "Similar", color: "text-yellow-500", bg: "bg-yellow-500/10" };
    return { label: "Needs Improvement", color: "text-red-500", bg: "bg-red-500/10" };
  };

  /* ═══════════════════════════════════════ */
  /*  RENDER                                */
  /* ═══════════════════════════════════════ */

  // ─── LOADING ───
  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading interview...</p>
        </div>
      </div>
    );
  }

  // ─── COMPLETED / TERMINATED / EVALUATING ───
  if (phase === "evaluating") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#010736]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="h-20 w-20 mx-auto rounded-2xl bg-[#0D1C42] border border-[#22396F] flex items-center justify-center shadow-lg"
          >
            <Brain className="h-10 w-10 text-[#FCF1D0]" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold mb-2">AI is Evaluating...</h2>
            <p className="text-muted-foreground text-sm">
              Analyzing all {store.answers.length} answers at once for faster results
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Evaluating answers</span>
              <span>{Math.round(evalProgress)}%</span>
            </div>
            <Progress value={evalProgress} className="h-2" />
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Please wait — this usually takes 10-20 seconds</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === "completed" || phase === "terminated") {
    return (
      <div className="min-h-screen bg-white dark:bg-[#010736] text-[#010736] dark:text-white transition-colors duration-200">
        {phase === "terminated" ? (
          /* ─── TERMINATED ─── */
          <div className="min-h-screen flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="h-24 w-24 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center"
              >
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-red-500 mb-2">Interview Terminated</h2>
                <p className="text-muted-foreground text-sm">
                  This session was ended due to security violations.
                </p>
              </div>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </motion.div>
          </div>
        ) : (
          /* ─── COMPLETED ─── */
          <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-sm text-muted-foreground font-medium tracking-widest uppercase mb-2">
                Interview Complete
              </p>
              <h1 className="text-3xl font-bold">{store.jobTitle}</h1>
            </motion.div>

            {/* Score + Reaction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <ScoreReaction
                score={store.overallScore ?? 0}
                recommendation={store.aiRecommendation ?? undefined}
                jobTitle={store.jobTitle}
              />
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                {
                  label: "Questions Answered",
                  value: `${store.answers.length} / ${store.questions.length}`,
                },
                {
                  label: "Overall Score",
                  value: `${store.overallScore ?? 0}%`,
                },
                {
                  label: "Avg per Question",
                  value: store.answers.length
                    ? `${Math.round(store.answers.reduce((s, a) => s + (a.evaluation?.score ?? 0), 0) / store.answers.length)}%`
                    : "—",
                },
              ].map((stat, i) => (
                <Card key={i} className="text-center">
                  <CardContent className="py-4 px-3">
                    <p className="text-2xl font-black text-primary">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Per-question breakdown */}
            {store.answers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Question Breakdown
                </h2>
                <div className="space-y-3">
                  {store.answers.map((a, i) => {
                    const s = a.evaluation?.score ?? 0;
                    const sl = getScoreLabel(s);
                    const q = store.questions[i];
                    const pct = Math.min(s, 100);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + i * 0.06 }}
                      >
                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Score bubble */}
                              <div
                                className={`shrink-0 h-12 w-12 rounded-xl flex flex-col items-center justify-center ${sl.bg} border`}
                              >
                                <span className={`text-sm font-black ${sl.color}`}>{s}</span>
                                <span className={`text-[9px] font-medium ${sl.color} opacity-70`}>/ 100</span>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-semibold text-muted-foreground">Q{i + 1}</span>
                                  <Badge className={`${sl.bg} ${sl.color} border-0 text-[10px] px-2`}>{sl.label}</Badge>
                                </div>
                                {q && (
                                  <p className="text-sm font-medium leading-snug line-clamp-2">
                                    {q.questionText || q.question}
                                  </p>
                                )}
                                {/* Score bar */}
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                  <motion.div
                                    className={`h-full rounded-full ${s >= 70 ? "bg-green-500" : s >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ delay: 0.8 + i * 0.06, duration: 0.6, ease: "easeOut" }}
                                  />
                                </div>
                                {a.evaluation?.feedback && (
                                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                                    {a.evaluation.feedback}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex justify-center pb-8"
            >
              <Button
                onClick={() => router.push("/dashboard")}
                size="lg"
                className="bg-[#FCF1D0] text-[#010736] hover:bg-[#f5e6b8] font-bold px-10 transition-colors"
              >
                Return to Dashboard
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // ─── READY SCREEN with DEMO TUTORIAL ───
  if (phase === "ready") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#010736]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-3xl"
        >
          <Card className="shadow-2xl border-[#22396F] bg-[#0D1C42] overflow-hidden">
            <CardContent className="p-0">
              {/* Hero Header */}
              <div className="relative bg-[#0D1C42] border-b border-[#22396F] p-8 pb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="h-20 w-20 mx-auto rounded-2xl bg-[#010736] border border-[#22396F] flex items-center justify-center mb-4"
                >
                  <Brain className="h-10 w-10 text-[#FCF1D0]" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-center mb-1"
                >
                  AI Interview: {store.jobTitle}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-muted-foreground text-sm"
                >
                  {store.questions.length} questions •{" "}
                  ~{Math.round((store.questions.length * 120) / 60)} min • Voice Interview
                </motion.p>
              </div>

              <div className="p-8 pt-6 space-y-6">
                {/* Demo Tutorial - Step by Step */}
                <div>
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">?</span>
                    How the Interview Works
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        step: 1,
                        icon: Volume2,
                        title: "AI Asks Question",
                        desc: "The AI interviewer reads each question aloud via voice",
                        delay: 0.5,
                      },
                      {
                        step: 2,
                        icon: Mic,
                        title: "You Speak Answer",
                        desc: "Your microphone captures and converts speech to text live",
                        delay: 0.6,
                      },
                      {
                        step: 3,
                        icon: CheckCircle2,
                        title: "AI Evaluates",
                        desc: "All answers are batch-evaluated after the interview for fast results",
                        delay: 0.7,
                      },
                    ].map((item) => (
                      <motion.div
                        key={item.step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: item.delay, duration: 0.4 }}
                        className="relative group"
                      >
                        <div className="rounded-xl border border-border/60 p-4 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-card h-full">
                          <div className="h-10 w-10 rounded-lg bg-[#22396F] text-[#FCF1D0] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <item.icon className="h-5 w-5 text-[#FCF1D0]" />
                          </div>
                          <div className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-[#FCF1D0] text-[#010736] text-xs font-bold flex items-center justify-center shadow">
                            {item.step}
                          </div>
                          <h4 className="text-sm font-semibold mb-1">{item.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Quick Info Grid */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="grid grid-cols-2 gap-2"
                >
                  {[
                    { icon: Camera, text: "Camera & Mic required — must allow access", color: "text-blue-500" },
                    { icon: Shield, text: "AI security monitoring", color: "text-green-500" },
                    { icon: Clock, text: "~1 min per question", color: "text-purple-500" },
                    { icon: Brain, text: "Smart AI evaluation", color: "text-orange-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-muted-foreground rounded-lg border border-border/40 p-2.5 hover:bg-muted/30 transition-colors">
                      <item.icon className={`h-4 w-4 ${item.color} shrink-0`} />
                      {item.text}
                    </div>
                  ))}
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="space-y-3 pt-2"
                >
                  <Button
                    onClick={handleStart}
                    className="w-full h-12 bg-[#FCF1D0] text-[#010736] hover:bg-[#f5e6b8] text-base font-bold group transition-colors"
                  >
                    <Video className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" /> Start Interview
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" onClick={() => router.back()} className="w-full">
                    Go Back
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ═══════════════════════════════════════ */
  /*  IN-PROGRESS: prep / intro / question  */
  /* ═══════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background">
      {/* ─── TOP BAR ─── */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Brain className="h-5 w-5 text-primary shrink-0" />
            <h1 className="text-sm font-semibold truncate">{store.jobTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1 text-xs">
              <Shield className="h-3 w-3" />
              {violationLogger.totalScore}%
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {formatTime(store.totalTimeRemaining)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Q {store.currentQuestionIndex + 1}/{store.questions.length}
            </Badge>
          </div>
        </div>
        <Progress
          value={
            ((store.currentQuestionIndex + (phase === "question" ? 0 : 0)) /
              store.questions.length) *
            100
          }
          className="h-1"
        />
      </div>

      {/* ═══════════════════════════════════════ */}
      {/*  PREPARATION PHASE                     */}
      {/* ═══════════════════════════════════════ */}
      {phase === "prep" && (
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Countdown */}
            <Card className="shadow-xl border-primary/10">
              <CardContent className="p-8 text-center space-y-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Clock className="h-16 w-16 text-primary mx-auto" />
                </motion.div>
                <h2 className="text-3xl font-bold">Get Ready</h2>
                <p className="text-muted-foreground">AI interviewer starts in...</p>
                <motion.div
                  key={prepTime}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-7xl font-black text-[#FCF1D0]"
                >
                  {prepTime}
                </motion.div>
                <div className="text-left bg-muted/30 rounded-xl p-5 text-sm space-y-2.5 border border-border/40">
                  <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> <span>Ensure quiet environment</span></p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> <span>Camera & mic are on</span></p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> <span>~1 min per question</span></p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> <span>Speak clearly — AI converts voice to text</span></p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
                    setPhase("intro");
                  }}
                >
                  <SkipForward className="h-4 w-4 mr-1" /> Skip → Start Now
                </Button>
              </CardContent>
            </Card>

            {/* Camera Preview */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black">
                  <video
                    ref={video.videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {!video.hasPermission && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted gap-2">
                      <VideoOff className="h-10 w-10 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Camera not available</p>
                    </div>
                  )}
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        video.hasPermission ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">Camera</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-xs text-muted-foreground">Mic Ready</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/*  AI INTRODUCTION PHASE                 */}
      {/* ═══════════════════════════════════════ */}
      {phase === "intro" && (
        <div className="mx-auto max-w-3xl px-4 py-16">
          <Card className="shadow-2xl border-primary/10">
            <CardContent className="p-10 text-center space-y-6">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-24 w-24 mx-auto rounded-full bg-[#0D1C42] border border-[#22396F] flex items-center justify-center"
              >
                <Brain className="h-12 w-12 text-[#FCF1D0]" />
              </motion.div>
              <h2 className="text-2xl font-bold">AI Interviewer Speaking...</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Listen carefully. The interview will begin shortly.
              </p>
              {/* Sound wave animation */}
              <div className="flex items-center justify-center gap-1.5 h-8">
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-primary rounded-full"
                    animate={{
                      height: [8, 20 + Math.random() * 12, 8],
                    }}
                    transition={{
                      duration: 0.6 + Math.random() * 0.4,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setAiSpeaking(false);
                  setPhase("question");
                }}
              >
                Skip Introduction →
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/*  QUESTION PHASE                        */}
      {/* ═══════════════════════════════════════ */}
      {phase === "question" && currentQ && (
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* ─── LEFT: Question + Voice Answer ─── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Question Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={store.currentQuestionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                            {store.currentQuestionIndex + 1}
                          </span>
                          <Badge variant="outline" className="capitalize text-xs flex items-center gap-1.5">
                            {(() => {
                              const CatIcon = categoryIcon[currentQ.category || ""] || FileText;
                              return <CatIcon className="h-3.5 w-3.5" />;
                            })()}
                            {currentQ.category || currentQ.type || "general"}
                          </Badge>
                          {currentQ.difficulty && (
                            <Badge
                              className={`text-[10px] capitalize ${
                                currentQ.difficulty === "easy"
                                  ? "bg-green-500/10 text-green-600"
                                  : currentQ.difficulty === "hard"
                                  ? "bg-red-500/10 text-red-600"
                                  : "bg-yellow-500/10 text-yellow-600"
                              }`}
                            >
                              {currentQ.difficulty}
                            </Badge>
                          )}
                        </div>
                        <div
                          className={`flex items-center gap-1.5 font-mono text-sm font-medium ${
                            isLowTime
                              ? "text-red-500 animate-pulse"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Clock className="h-4 w-4" />
                          {formatTime(store.timeRemaining)}
                        </div>
                      </div>

                      <h2 className="text-lg font-semibold leading-relaxed mb-4">
                        {currentQ.questionText || currentQ.question}
                      </h2>

                      {/* AI Speaking indicator */}
                      {aiSpeaking && (
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <Volume2 className="h-4 w-4 animate-pulse" />
                          <span>AI is reading the question...</span>
                        </div>
                      )}

                      {/* Replay button */}
                      {!aiSpeaking && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAiSpeaking(true);
                            aiSpeak(
                              currentQ.questionText || currentQ.question || "",
                              () => setAiSpeaking(false)
                            );
                          }}
                        >
                          <Volume2 className="h-4 w-4 mr-1" /> Replay Question
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {/* ─── Ultra-Modern Voice-Only Answer Area (Text Input Forbidden) ─── */}
              <Card className="border border-[#22396F]/30 bg-gradient-to-b from-card to-card/60 shadow-xl overflow-hidden relative">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500" />
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          {speech.isListening && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          )}
                          <span className={`relative inline-flex rounded-full h-3 w-3 ${speech.isListening ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                        </span>
                        <h3 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                          <Mic className="h-4 w-4 text-[#22396F] dark:text-[#FCF1D0]" /> Voice Response Mode
                        </h3>
                      </div>
                      
                      {/* Strictly Spoken Answers Badge */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                        🔒 Voice Only • No Keyboard
                      </span>

                      {/* Bilingual Language Selector */}
                      <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            speech.setLanguage("en-US");
                            toast.info("Speech recognition language set to English (US)");
                          }}
                          className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                            speech.language === "en-US"
                              ? "bg-white dark:bg-[#010736] text-[#010736] dark:text-[#FCF1D0] shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          🇬🇧 English
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            speech.setLanguage("bn-BD");
                            toast.info("Speech recognition language set to বাংলা (Bengali)");
                          }}
                          className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                            speech.language === "bn-BD"
                              ? "bg-white dark:bg-[#010736] text-[#010736] dark:text-[#FCF1D0] shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          🇧🇩 বাংলা
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={speech.isListening ? "destructive" : "default"}
                        size="sm"
                        onClick={() => {
                          if (speech.isListening) {
                            speech.stopListening();
                          } else {
                            speech.startListening();
                          }
                        }}
                        disabled={!speech.isSupported || aiSpeaking}
                        className="font-semibold shadow-xs"
                      >
                        {speech.isListening ? (
                          <>
                            <MicOff className="h-4 w-4 mr-1.5" /> Pause Mic
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4 mr-1.5" /> Start Speaking
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Language guidance banner */}
                  <div className="text-xs text-muted-foreground mb-4 flex items-center justify-between bg-muted/30 px-3.5 py-2 rounded-xl border border-border/40">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-[#22396F] dark:text-[#FCF1D0] shrink-0" />
                      <span>
                        {speech.language === "bn-BD"
                          ? "বাংলায় সরাসরি কথা বলুন — কোনো কিবোর্ড টাইপিং অনুমোদন নেই, এআই নির্ভুলভাবে আপনার বক্তব্য শুনবে।"
                          : "Voice-only proctored assessment. Speak naturally into your microphone; keyboard typing is disabled."}
                      </span>
                    </div>
                    {speech.isListening && (
                      <div className="flex items-center gap-1.5 shrink-0 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        <Radio className="h-3.5 w-3.5 animate-pulse" /> LIVE AUDIO
                      </div>
                    )}
                  </div>

                  {/* Audio Reactive Speech Wave Visualizer */}
                  {speech.isListening && (
                    <div className="flex items-center justify-center gap-1.5 py-2 mb-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                      {[40, 75, 100, 60, 90, 45, 80, 50, 95, 65, 35].map((h, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [8, h * 0.28, 8] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.8,
                            delay: i * 0.08,
                            ease: "easeInOut",
                          }}
                          className="w-1.5 rounded-full bg-emerald-500"
                        />
                      ))}
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 ml-2">
                        {speech.language === "bn-BD" ? "শুনছি... ক্যামেরার দিকে তাকিয়ে কথা বলুন" : "Capturing speech... Look directly at the camera"}
                      </span>
                    </div>
                  )}

                  {/* Real-time Voice Transcript Display (Read-Only) */}
                  <div className="min-h-[140px] rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm leading-relaxed relative">
                    {speech.transcript ? (
                      <div className="space-y-1">
                        <p className="text-foreground font-medium text-base leading-relaxed tracking-wide">
                          {speech.transcript}
                        </p>
                        {speech.interimTranscript && (
                          <p className="text-primary/70 italic text-sm animate-pulse">
                            {speech.interimTranscript} ...
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="h-full min-h-[100px] flex flex-col items-center justify-center text-center p-4">
                        <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center mb-2">
                          <Mic className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {aiSpeaking
                            ? "AI interviewer is speaking... Please wait before answering."
                            : speech.isListening
                            ? speech.language === "bn-BD"
                              ? "আপনার উত্তর বলা শুরু করুন... আপনার ভয়েস এখানে স্বয়ংক্রিয়ভাবে টেক্সট হিসেবে আসবে।"
                              : "Speak your answer into the microphone now..."
                            : "Click 'Start Speaking' to begin your verbal response."}
                        </p>
                        <p className="text-[11px] text-muted-foreground/70 mt-1">
                          No text input permitted. Answers must be submitted via voice.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Speech error */}
                  {speech.error && (
                    <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> {speech.error}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-muted-foreground">
                      {speech.transcript.length > 0
                        ? `${speech.transcript.split(/\s+/).filter(Boolean).length} words`
                        : "No answer yet"}
                    </p>
                    <Button
                      onClick={handleManualSubmit}
                      disabled={submitting || !speech.transcript.trim()}
                      className="bg-[#FCF1D0] text-[#010736] hover:bg-[#f5e6b8] font-bold transition-colors"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Evaluating...
                        </>
                      ) : store.currentQuestionIndex === store.questions.length - 1 ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Submit & Complete
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-4 w-4 mr-2" /> Submit Answer
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* ─── Saving Indicator ─── */}
              <AnimatePresence>
                {submitting && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="border-2 border-primary/20 bg-primary/5">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <div>
                          <p className="text-sm font-medium">Saving answer...</p>
                          <p className="text-xs text-muted-foreground">Moving to next question shortly</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── RIGHT SIDEBAR ─── */}
            <div className="space-y-4">
              {/* Camera & Eye-Contact Proctoring Feed */}
              <Card className="overflow-hidden border border-[#22396F]/30 shadow-lg">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3] bg-black overflow-hidden rounded-t-xl">
                    <video
                      ref={sidebarVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />

                    {/* Camera Focus HUD / Gaze Alignment Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      {faceDetection.lastResult.gazeStatus === "focused" ? (
                        <div className="flex items-center gap-1.5 bg-emerald-600/90 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] text-white font-bold shadow-md">
                          <Target className="h-3 w-3" /> Focus: Centered 🎯
                        </div>
                      ) : faceDetection.lastResult.gazeStatus === "looking_away" ? (
                        <div className="flex items-center gap-1.5 bg-amber-500/95 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] text-black font-extrabold shadow-md animate-pulse">
                          <EyeOff className="h-3 w-3" /> ⚠️ Look at Camera!
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-red-600/90 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] text-white font-bold shadow-md animate-bounce">
                          <AlertTriangle className="h-3 w-3" /> Face Missing
                        </div>
                      )}
                    </div>

                    {/* Proctored Recording Badge */}
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-red-600/90 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] text-white font-bold shadow-md">
                      <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      <span>PROCTORED</span>
                    </div>

                    {/* Subtle Gaze Alignment Crosshair Guide */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div
                        className={`h-28 w-28 rounded-full border border-dashed transition-all duration-300 ${
                          faceDetection.lastResult.gazeStatus === "focused"
                            ? "border-emerald-400/30 scale-100"
                            : "border-amber-400/60 scale-105"
                        }`}
                      />
                    </div>

                    {!video.hasPermission && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <VideoOff className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Bottom Warning HUD */}
                    {faceWarning && (
                      <div className="absolute inset-x-0 bottom-0 bg-red-600/90 backdrop-blur-md text-white text-[10px] text-center py-1.5 flex items-center justify-center gap-1.5 font-bold z-10">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Face not detected — Sit upright &amp; look directly into camera</span>
                      </div>
                    )}
                    {!faceWarning && faceDetection.lastResult.isLookingAway && (
                      <div className="absolute inset-x-0 bottom-0 bg-amber-500/90 backdrop-blur-md text-black text-[10px] text-center py-1 flex items-center justify-center gap-1.5 font-bold z-10">
                        <EyeOff className="h-3.5 w-3.5 shrink-0" />
                        <span>Focus on the camera lens while answering</span>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 bg-card flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          video.hasPermission ? "bg-emerald-500 shadow-xs shadow-emerald-500/50" : "bg-red-500"
                        }`}
                      />
                      <span className="text-[11px] font-medium text-muted-foreground">Camera Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          speech.isListening ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"
                        }`}
                      />
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {speech.isListening ? "Voice Active" : "Mic Idle"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security & Proctoring Metrics */}
              <Card className="border border-[#22396F]/30 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-primary" /> Anti-Cheating System
                    </h3>
                    {penaltyPoints > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 text-[11px] font-extrabold border border-red-500/30">
                        -{penaltyPoints} Penalty Marks
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                        Clean Record
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Security Integrity</span>
                      <span
                        className={`font-bold ${
                          violationLogger.totalScore >= 75
                            ? "text-emerald-500"
                            : violationLogger.totalScore >= 50
                            ? "text-amber-500"
                            : "text-red-500"
                        }`}
                      >
                        {violationLogger.totalScore}%
                      </span>
                    </div>
                    <Progress value={violationLogger.totalScore} className="h-2" />

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            fullscreen.isFullScreen ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                        <span>Fullscreen</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            tabSwitch.isTabVisible ? "bg-emerald-500" : "bg-red-500 animate-ping"
                          }`}
                        />
                        <span>Tab Lock</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            faceDetection.lastResult.gazeStatus === "focused" ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                        <span>Camera Gaze</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>Voice Only 🎙️</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Question Map */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Questions</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {store.questions.map((q, i) => {
                      const answered = store.answers.some(
                        (a) => a.questionId === (q._id || String(i))
                      );
                      const answerScore = store.answers.find(
                        (a) => a.questionId === (q._id || String(i))
                      )?.evaluation?.score;
                      return (
                        <button
                          key={i}
                          title={
                            answered
                              ? `Q${i + 1}: Score ${answerScore ?? "?"}/100`
                              : `Q${i + 1}`
                          }
                          className={`h-7 w-7 rounded text-xs font-medium transition-all ${
                            i === store.currentQuestionIndex
                              ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30"
                              : answered
                              ? answerScore != null && answerScore >= 70
                                ? "bg-green-500/10 text-green-600 border border-green-500/30"
                                : answerScore != null && answerScore >= 40
                                ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/30"
                                : "bg-red-500/10 text-red-600 border border-red-500/30"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Answered summary */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-2">Progress</h3>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Answered</span>
                      <span className="font-semibold">
                        {store.answers.length}/{store.questions.length}
                      </span>
                    </div>
                    {store.answers.length > 0 && (
                      <div className="flex justify-between">
                        <span>Avg Score</span>
                        <span className="font-semibold">
                          {Math.round(
                            store.answers.reduce(
                              (sum, a) => sum + (a.evaluation?.score ?? 0),
                              0
                            ) / store.answers.length
                          )}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Violation Modal with Sound & Marks Deduction Notice */}
      <ViolationWarningModal
        isOpen={warningModal.open}
        type={warningModal.type}
        warningCount={store.warningCount}
        maxWarnings={MAX_WARNINGS}
        penaltyMarks={warningModal.penalty}
        isFirstWarning={warningModal.isFirstWarning}
        nextPenaltyMarks={warningModal.nextPenaltyMarks}
        onDismiss={() =>
          setWarningModal({
            open: false,
            type: "",
            penalty: 5,
            isFirstWarning: false,
            nextPenaltyMarks: 5,
          })
        }
      />
    </div>
  );
}
