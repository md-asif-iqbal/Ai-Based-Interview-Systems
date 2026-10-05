"use client";

import { motion } from "framer-motion";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Eye,
  MonitorOff,
  Copy,
  MousePointer,
  Wrench,
  Camera,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Violation {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  timestamp: string;
  action?: string;
}

interface SecurityReportViewerProps {
  securityScore: number;
  violations: Violation[];
  interviewDuration?: number;
  wasTerminated?: boolean;
}

const violationIcons: Record<string, React.ReactNode> = {
  tab_switch: <Eye className="h-4 w-4" />,
  window_blur: <Eye className="h-4 w-4" />,
  fullscreen_exit: <MonitorOff className="h-4 w-4" />,
  no_face: <Camera className="h-4 w-4" />,
  multiple_faces: <Users className="h-4 w-4" />,
  copy_paste: <Copy className="h-4 w-4" />,
  right_click: <MousePointer className="h-4 w-4" />,
  dev_tools: <Wrench className="h-4 w-4" />,
  screenshot: <Camera className="h-4 w-4" />,
  looking_away: <Eye className="h-4 w-4" />,
};

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  low: { color: "text-[#FCF1D0]", bg: "bg-[#22396F]", border: "border-0" },
  medium: { color: "text-white", bg: "bg-[#0D1C42]", border: "border-[#22396F]" },
  high: { color: "text-[#FCF1D0]", bg: "bg-[#010736]", border: "border-[#22396F]" },
  critical: { color: "text-white", bg: "bg-[#010736]", border: "border-[#22396F]" },
};

export default function SecurityReportViewer({
  securityScore,
  violations,
  interviewDuration,
  wasTerminated,
}: SecurityReportViewerProps) {
  const scoreColor =
    securityScore >= 80 ? "text-green-500" :
    securityScore >= 60 ? "text-yellow-500" :
    securityScore >= 40 ? "text-orange-500" :
    "text-red-500";

  const scoreLabel =
    securityScore >= 80 ? "Excellent" :
    securityScore >= 60 ? "Good" :
    securityScore >= 40 ? "Fair" :
    "Poor";

  // Group violations by type
  const violationGroups: Record<string, number> = {};
  violations.forEach((v) => {
    violationGroups[v.type] = (violationGroups[v.type] || 0) + 1;
  });

  const severityCounts = {
    critical: violations.filter((v) => v.severity === "critical").length,
    high: violations.filter((v) => v.severity === "high").length,
    medium: violations.filter((v) => v.severity === "medium").length,
    low: violations.filter((v) => v.severity === "low").length,
  };

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className={`border-border/40 overflow-hidden ${wasTerminated ? "border-red-500/30" : ""}`}>
          <div className={`p-6 ${wasTerminated ? "bg-red-500/10" : "bg-[#0D1C42] border-b border-[#22396F]"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#22396F] bg-[#010736]">
                  {wasTerminated ? (
                    <ShieldAlert className="h-10 w-10 text-white" />
                  ) : securityScore >= 80 ? (
                    <ShieldCheck className="h-10 w-10 text-[#FCF1D0]" />
                  ) : (
                    <Shield className="h-10 w-10 text-[#FCF1D0]" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold">Security Report</h2>
                  {wasTerminated && (
                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
                      TERMINATED
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div>
                    <span className={`text-3xl font-bold ${scoreColor}`}>{securityScore}</span>
                    <span className="text-lg text-muted-foreground">/100</span>
                  </div>
                  <Badge variant="outline" className={`${scoreColor}`}>{scoreLabel}</Badge>
                </div>
                <Progress value={securityScore} className="h-3 w-full max-w-xs" />
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" /> {violations.length} violations
                  </span>
                  {interviewDuration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {Math.floor(interviewDuration / 60)}m {interviewDuration % 60}s
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Severity Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Critical", count: severityCounts.critical, color: "text-white", bg: "bg-[#010736]" },
            { label: "High", count: severityCounts.high, color: "text-[#FCF1D0]", bg: "bg-[#0D1C42]" },
            { label: "Medium", count: severityCounts.medium, color: "text-white", bg: "bg-[#0D1C42]" },
            { label: "Low", count: severityCounts.low, color: "text-[#FCF1D0]", bg: "bg-[#22396F]" },
          ].map((s) => (
            <Card key={s.label} className="border-border/40">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Violation Types Summary */}
      {Object.keys(violationGroups).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" /> Violation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(violationGroups)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {violationIcons[type] || <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize">{type.replace(/_/g, " ")}</p>
                        <div className="h-1.5 rounded-full bg-muted mt-1">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.min(100, (count / Math.max(...Object.values(violationGroups))) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">{count}x</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Timeline */}
      {violations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Violation Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-4 pl-6 before:absolute before:left-2.75 before:top-2 before:bottom-2 before:w-px before:bg-border">
                {violations.map((v, i) => {
                  const cfg = severityConfig[v.severity] || severityConfig.low;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.03 }}
                      className="relative"
                    >
                      <div className={`absolute -left-6 top-1 h-3 w-3 rounded-full border-2 ${cfg.bg} ${cfg.border}`} />
                      <div className={`rounded-lg p-3 ${cfg.bg} border ${cfg.border}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={cfg.color}>
                              {violationIcons[v.type] || <AlertTriangle className="h-4 w-4" />}
                            </span>
                            <div>
                              <p className="text-sm font-medium">{v.description}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {new Date(v.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize ${cfg.color} ${cfg.border}`}
                          >
                            {v.severity}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {violations.length === 0 && (
        <Card className="border-border/40">
          <CardContent className="py-12 text-center">
            <ShieldCheck className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Clean Record</h3>
            <p className="text-sm text-muted-foreground">No security violations were detected during this interview.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
