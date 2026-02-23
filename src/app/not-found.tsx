"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl"
          animate={{ x: [0, 50, -30, 0], y: [0, -40, 20, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl"
          animate={{ x: [0, -40, 30, 0], y: [0, 30, -50, 0], scale: [1, 0.9, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full bg-purple-500/8 blur-3xl"
          animate={{ x: [0, 60, -20, 0], y: [0, -20, 40, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="text-center max-w-lg mx-auto">
        {/* 3D Animated 404 */}
        <motion.div
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          style={{ perspective: 1000 }}
        >
          <motion.div
            animate={{ rotateY: [0, 5, -5, 0], rotateX: [0, -3, 3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <h1 className="text-[10rem] sm:text-[14rem] font-black leading-none select-none">
              <motion.span
                className="inline-block bg-gradient-to-br from-primary via-accent to-purple-500 bg-clip-text text-transparent"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                4
              </motion.span>
              <motion.span
                className="inline-block bg-gradient-to-br from-accent via-purple-500 to-primary bg-clip-text text-transparent"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              >
                0
              </motion.span>
              <motion.span
                className="inline-block bg-gradient-to-br from-purple-500 via-primary to-accent bg-clip-text text-transparent"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              >
                4
              </motion.span>
            </h1>
          </motion.div>
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 15 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/20"
              style={{
                left: `${10 + (i * 6) % 80}%`,
                top: `${15 + (i * 7) % 70}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Search className="h-5 w-5 text-primary" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Page Not Found
            </h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
        >
          <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" /> Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" /> Browse Jobs
            </Link>
          </Button>
        </motion.div>

        {/* Glowing bottom line */}
        <motion.div
          className="mt-12 h-1 rounded-full mx-auto max-w-48"
          style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
