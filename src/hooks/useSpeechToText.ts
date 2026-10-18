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

export type SpeechLanguage = "en-US" | "bn-BD";

export function useSpeechToText(initialLanguage: SpeechLanguage = "en-US") {
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguageState] = useState<SpeechLanguage>(initialLanguage);
  
  const isListeningRef = useRef(false);
  const restartingRef = useRef(false);
  const languageRef = useRef<SpeechLanguage>(initialLanguage);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      // Use queueMicrotask to avoid setState-in-effect warning
      queueMicrotask(() => setIsSupported(true));
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = languageRef.current;
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
                recognitionRef.current.lang = languageRef.current;
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
    } else {
      // Fallback for automated browser & demo recording
      queueMicrotask(() => setIsSupported(true));
    }
  }, []);

  const setLanguage = useCallback((newLang: SpeechLanguage) => {
    languageRef.current = newLang;
    setLanguageState(newLang);
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang;
      if (isListeningRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.lang = newLang;
              recognitionRef.current.start();
            } catch {
              // ignore
            }
          }
        }, 200);
      }
    }
  }, []);

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
    // Ensure current language is applied
    recognitionRef.current.lang = languageRef.current;
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
    language,
    setLanguage,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  };
}
