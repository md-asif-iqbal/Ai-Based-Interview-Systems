"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Award, CheckCircle2, HelpCircle, XCircle } from "lucide-react";

interface ScoreReactionProps {
  score: number;
  recommendation?: string;
  jobTitle?: string;
}

const CONFETTI_COLORS = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

// Pre-compute stable random values outside component so they never change on re-render
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: (i * 37 + 13) % 100,
  delay: (i * 0.05) % 0.5,
  duration: 2 + (i * 0.13) % 2,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 4 + (i * 0.3) % 6,
  rotation: (i * 24) % 360,
  driftA: ((i % 7) - 3) * 25,
  driftB: ((i % 5) - 2) * 50,
}));

// Confetti particle component
function Confetti() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: "-5%",
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: "110vh",
            opacity: [1, 1, 0],
            rotate: p.rotation + 720,
            x: [0, p.driftA, p.driftB],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}

// The 3D animated score circle
function AnimatedScoreCircle({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * eased));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [score]);

  const getColor = () => {
    if (score >= 85) return "#FCF1D0";
    if (score >= 70) return "#FCF1D0";
    if (score >= 50) return "#ffffff";
    return "#ef4444";
  };

  const ringColor = getColor();
  const circumference = 2 * Math.PI * 54;

  return (
    <motion.div
      className="relative"
      initial={{ scale: 0, rotateY: 180 }}
      animate={{ scale: 1, rotateY: 0 }}
      transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 150 }}
      style={{ perspective: 1000 }}
    >
      {/* Background ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-[#22396F] bg-[#010736]/40"
        animate={{
          scale: [1, 1.04, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 3D rotating ring */}
      <motion.div
        className="relative"
        animate={{ rotateY: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <svg className="h-40 w-40" viewBox="0 0 120 120">
          {/* Background track */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/20"
          />
          {/* Score arc */}
          <motion.circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (circumference * score) / 100 }}
            transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
            transform="rotate(-90 60 60)"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-5xl font-black text-[#FCF1D0]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {displayScore}%
          </motion.span>
          <motion.span
            className="text-[11px] text-muted-foreground font-medium tracking-wider uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Overall Score
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ScoreReaction({ score, recommendation, jobTitle }: ScoreReactionProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => setPhase(3), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Score-based configuration
  const getConfig = () => {
    if (score >= 85) {
      return {
        title: "Outstanding Performance",
        subtitle: "You absolutely nailed it!",
        message:
          "Your responses demonstrate exceptional knowledge and communication. You're a top-tier candidate for this role. The hiring team will be impressed!",
        showConfetti: true,
      };
    }
    if (score >= 70) {
      return {
        title: "Great Job",
        subtitle: "Solid performance overall",
        message:
          "You demonstrated strong skills and knowledge. With a few refinements, you'd be an even stronger candidate. Keep up the excellent work!",
        showConfetti: false,
      };
    }
    if (score >= 50) {
      return {
        title: "Room to Grow",
        subtitle: "You showed potential",
        message:
          "You have a solid foundation to build on. Focus on strengthening your technical depth and providing more detailed examples. You'll do better next time!",
        showConfetti: false,
      };
    }
    return {
      title: "Keep Practicing",
      subtitle: "Every expert was once a beginner",
      message:
        "Don't be discouraged! This is a learning opportunity. Review the topics covered, practice your answers, and come back stronger. Success is built on persistence.",
      showConfetti: false,
    };
  };

  const config = getConfig();

  const recLabel = {
    strong_hire: { text: "Strong Hire — Excellent Fit!", color: "text-green-600", bg: "bg-green-500/10 border-green-500/20", icon: Award },
    hire: { text: "Hire — Good Fit", color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    maybe: { text: "Maybe — Needs Improvement", color: "text-yellow-600", bg: "bg-yellow-500/10 border-yellow-500/20", icon: HelpCircle },
    no_hire: { text: "Not a Fit — Keep Practicing", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", icon: XCircle },
  }[recommendation || ""] || null;

  return (
    <div className="relative">
      {/* Confetti for top scores only */}
      <AnimatePresence>
        {config.showConfetti && phase >= 1 && <Confetti />}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative bg-[#0D1C42] rounded-2xl border border-[#22396F] p-8 overflow-hidden">
        {/* Subtle decorative circles */}
        <motion.div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#22396F]/20 pointer-events-none"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#010736]/60 pointer-events-none"
          animate={{
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        {/* Score Circle */}
        <div className="flex justify-center mb-6">
          <AnimatedScoreCircle score={score} />
        </div>

        {/* Title */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-center mb-4"
            >
              <h2 className="text-2xl font-bold mb-1">{config.title}</h2>
              <p className="text-sm text-muted-foreground">{config.subtitle}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recommendation Badge */}
        <AnimatePresence>
          {phase >= 2 && recLabel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotateX: 90 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="flex justify-center mb-4"
            >
              <div className={`rounded-xl px-5 py-2.5 border ${recLabel.bg}`}>
                {jobTitle && (
                  <p className="text-[10px] font-semibold text-center text-muted-foreground mb-0.5">
                    Position Fit: {jobTitle}
                  </p>
                )}
                <p className={`text-sm font-bold text-center flex items-center justify-center gap-1.5 ${recLabel.color}`}>
                  <recLabel.icon className="h-4 w-4 shrink-0" />
                  {recLabel.text}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                {config.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
