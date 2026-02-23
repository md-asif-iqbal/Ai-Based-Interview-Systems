"use client";

import { useRef, useState, useCallback, useEffect } from "react";

// Define types for Web Speech API
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

// Augment global Window type
declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  }
}

export function useSpeechToText() {
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isListeningRef = useRef(false);
  const restartingRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      // Use queueMicrotask to avoid setState-in-effect warning
      queueMicrotask(() => setIsSupported(true));
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 3;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            // Pick the alternative with highest confidence
            let bestTranscript = result[0].transcript;
            let bestConfidence = result[0].confidence || 0;
            for (let j = 1; j < result.length; j++) {
              if ((result[j].confidence || 0) > bestConfidence) {
                bestConfidence = result[j].confidence;
                bestTranscript = result[j].transcript;
              }
            }
            final += bestTranscript + " ";
          } else {
            interim += result[0].transcript;
          }
        }
        if (final) setTranscript((prev) => prev + final);
        setInterimTranscript(interim);
      };

      recognition.onerror = (event) => {
        // Ignore common non-critical errors
        if (event.error === "no-speech" || event.error === "aborted") {
          return;
        }
        setError(`Speech recognition error: ${event.error}`);
      };

      recognition.onend = () => {
        // Only auto-restart if we're supposed to be listening
        if (isListeningRef.current && !restartingRef.current) {
          restartingRef.current = true;
          // Small delay before restart to prevent rapid restart loops
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch {
                // Already started or other error — ignore
              }
            }
            restartingRef.current = false;
          }, 300);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []); // No dependency on isListening — use ref instead

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    // Stop any existing session first
    try {
      recognitionRef.current.stop();
    } catch {
      // ignore
    }
    // Clear transcript BEFORE starting — ensures no leftover AI-voice text
    setTranscript("");
    setInterimTranscript("");
    setError(null);
    isListeningRef.current = true;
    setIsListening(true);
    // Delay to flush any audio buffer from AI speaker output
    setTimeout(() => {
      if (isListeningRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // ignore — might already be started
        }
      }
    }, 150);
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setInterimTranscript("");
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {}
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
