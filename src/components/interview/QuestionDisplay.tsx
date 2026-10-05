"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Code2, MessageSquare, Brain, ChevronRight, ChevronLeft, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Question {
  _id: string;
  question: string;
  questionText?: string; // For compatibility with different field names
  type?: "technical" | "behavioral" | "situational";
  difficulty: "easy" | "medium" | "hard";
  category: string;
  timeLimit: number;
}

interface QuestionDisplayProps {
  question: Question;
  index: number;
  total: number;
  timeRemaining: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
  onStopSpeaking?: () => void;
}

export default function QuestionDisplay({
  question,
  index,
  total,
  timeRemaining,
  onNext,
  onPrevious,
  onSpeak,
  isSpeaking,
  onStopSpeaking,
}: QuestionDisplayProps) {
  // Use type if available, otherwise fallback to category
  const questionType = (question.type || question.category || "technical") as "technical" | "behavioral" | "situational";

  const typeIcons: Record<string, React.ReactNode> = {
    technical: <Code2 className="h-4 w-4" />,
    behavioral: <MessageSquare className="h-4 w-4" />,
    situational: <Brain className="h-4 w-4" />,
  };

  const difficultyColors: Record<string, string> = {
    easy: "bg-[#22396F] text-[#FCF1D0] border-0",
    medium: "bg-[#0D1C42] border border-[#22396F] text-white",
    hard: "bg-[#FCF1D0] text-[#010736] border-0 font-bold",
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const isLowTime = timeRemaining < 30;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question._id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-border/40">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                  {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize gap-1">
                    {typeIcons[questionType] || <Brain className="h-4 w-4" />}
                    {questionType}
                  </Badge>
                  <Badge className={`text-[10px] capitalize border ${difficultyColors[question.difficulty] || difficultyColors.medium}`}>
                    {question.difficulty}
                  </Badge>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-sm font-mono font-medium ${isLowTime ? "text-red-500 animate-pulse" : "text-muted-foreground"}`}>
                <Clock className="h-4 w-4" />
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-lg font-semibold leading-relaxed flex-1">
                  {question.questionText || question.question}
                </h2>
                {onSpeak && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => isSpeaking ? onStopSpeaking?.() : onSpeak(question.questionText || question.question)}
                    className={isSpeaking ? "text-primary border-primary/30" : ""}
                  >
                    {isSpeaking ? (
                      <><VolumeX className="h-4 w-4 mr-1" /> Stop</>
                    ) : (
                      <><Volume2 className="h-4 w-4 mr-1" /> Listen</>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                {Array.from({ length: total }, (_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-all ${
                      i === index ? "bg-primary w-4" : i < index ? "bg-primary/40" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={onPrevious}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <span className="text-xs text-muted-foreground">
                  {index + 1} of {total}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={index === total - 1}
                  onClick={onNext}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
