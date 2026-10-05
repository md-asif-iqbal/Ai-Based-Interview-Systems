"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ResumeUploadProps {
  onUploadComplete?: (data: { parsedResume: Record<string, unknown>; candidateId: string }) => void;
}

export default function ResumeUpload({ onUploadComplete }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "parsing" | "done" | "error">("idle");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (f.size > maxSize) {
      toast.error("File size must be under 5MB");
      return;
    }

    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(f.type)) {
      toast.error("Only PDF and DOCX files are supported");
      return;
    }

    setFile(f);
    setStatus("idle");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus("uploading");
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 40) {
          clearInterval(interval);
          return 40;
        }
        return p + 5;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      setProgress(50);
      setStatus("parsing");

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      setProgress(100);
      setStatus("done");
      toast.success("Resume parsed successfully!");
      onUploadComplete?.(data);
    } catch (err) {
      clearInterval(interval);
      setStatus("error");
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.01]"
            : status === "done"
            ? "border-green-500/40 bg-green-500/5"
            : status === "error"
            ? "border-destructive/40 bg-destructive/5"
            : "border-border hover:border-primary/40 hover:bg-muted/30"
        }`}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#010736] border border-[#22396F]">
                <Upload className="h-6 w-6 text-[#FCF1D0]" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF or DOCX up to 5MB</p>
              </div>
              <Button variant="outline" size="sm" type="button">
                Browse Files
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
              </div>
              {status === "done" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              ) : status === "error" ? (
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              ) : !uploading ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress */}
      <AnimatePresence>
        {(status === "uploading" || status === "parsing") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <Progress value={progress} className="h-2" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {status === "uploading" ? "Uploading resume..." : "AI is analyzing your resume..."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      {file && status !== "done" && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full h-11 bg-[#FCF1D0] text-[#010736] hover:bg-[#f5e6b8] font-semibold transition-colors"
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
          ) : (
            <><Upload className="h-4 w-4 mr-2" /> Upload & Analyze</>
          )}
        </Button>
      )}

      {status === "done" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 flex items-center gap-3"
        >
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">Resume Analyzed Successfully</p>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">Your profile has been updated with parsed data</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
