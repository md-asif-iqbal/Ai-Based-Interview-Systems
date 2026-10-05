"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#010736] text-[#010736] dark:text-white flex items-center justify-center p-4 overflow-hidden transition-colors duration-200">
      <div className="text-center max-w-lg mx-auto">
        {/* Animated 404 */}
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
            <h1 className="text-[9rem] sm:text-[12rem] font-black leading-none select-none tracking-tight">
              <span className="inline-block text-[#010736] dark:text-[#22396F]">
                4
              </span>
              <span className="inline-block text-[#22396F] dark:text-[#FCF1D0]">
                0
              </span>
              <span className="inline-block text-[#010736] dark:text-[#22396F]">
                4
              </span>
            </h1>
          </motion.div>
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Search className="h-5 w-5 text-[#010736] dark:text-[#FCF1D0]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#010736] dark:text-white">
              Page Not Found
            </h2>
          </div>
          <p className="text-[#64748b] dark:text-[#cbd5e1] text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
            The page you are looking for does not exist or has been relocated.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
        >
          <Button asChild className="w-full sm:w-auto bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold shadow-md">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" /> Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#22396F] dark:hover:text-[#FCF1D0]">
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" /> Browse Jobs
            </Link>
          </Button>
        </motion.div>

        {/* Solid bottom accent line */}
        <div className="mt-12 h-1 rounded-full mx-auto w-24 bg-[#010736] dark:bg-[#22396F]" />
      </div>
    </div>
  );
}
