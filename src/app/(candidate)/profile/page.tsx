"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Pencil,
  Save,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  profilePicture?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "" });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      const u = data.user;
      setUser(u);
      setForm({ fullName: u.fullName || "", phone: u.phone || "" });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser((prev) => prev ? { ...prev, ...data.data } : prev);
        setEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-white dark:bg-[#010736] text-[#010736] dark:text-white transition-colors duration-200">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-6 gap-2 text-[#64748b] hover:text-[#010736] dark:text-[#cbd5e1] dark:hover:text-[#FCF1D0] hover:bg-[#f1f5f9] dark:hover:bg-[#0D1C42]"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 overflow-hidden border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white shadow-sm">
            <div className="h-24 sm:h-32 bg-[#010736] dark:bg-[#22396F] relative" />
            <CardContent className="pt-0 pb-6 px-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 sm:-mt-10">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white dark:border-[#0D1C42] shadow-xl">
                    {user.profilePicture ? (
                      <AvatarImage src={user.profilePicture} alt={user.fullName} />
                    ) : null}
                    <AvatarFallback className="bg-[#010736] dark:bg-[#22396F] text-[#FCF1D0] text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#f8fafc] dark:bg-[#010736] border-2 border-[#cbd5e1] dark:border-[#22396F] flex items-center justify-center">
                    <Camera className="h-3.5 w-3.5 text-[#010736] dark:text-[#FCF1D0]" />
                  </div>
                </div>
                <div className="text-center sm:text-left flex-1 pb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#010736] dark:text-white">{user.fullName}</h1>
                  <p className="text-sm text-[#64748b] dark:text-[#cbd5e1]">{user.email}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <Badge className="capitalize bg-[#010736] dark:bg-[#22396F] text-[#FCF1D0] border-0">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {user.role}
                    </Badge>
                    <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(!editing)}
                  className="gap-2 shrink-0 border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#010736] text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#22396F] dark:hover:text-[#FCF1D0]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {editing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Details / Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-[#010736] dark:text-white">
                <User className="h-4 w-4 text-[#010736] dark:text-[#FCF1D0]" />
                {editing ? "Edit Profile" : "Profile Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-[#010736] dark:text-white">Full Name</Label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      className="bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white placeholder:text-[#94a3b8] focus:border-[#22396F] dark:focus:border-[#FCF1D0]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#010736] dark:text-white">Email Address</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-[#f1f5f9] dark:bg-[#010736]/60 border-[#cbd5e1] dark:border-[#22396F] text-[#64748b] dark:text-[#cbd5e1]"
                    />
                    <p className="text-xs text-[#64748b] dark:text-[#cbd5e1]">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[#010736] dark:text-white">Phone Number</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white placeholder:text-[#94a3b8] focus:border-[#22396F] dark:focus:border-[#FCF1D0]"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-3">
                    <Button variant="outline" className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#010736] text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#22396F]" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold gap-2 shadow-sm"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {[
                    { icon: User, label: "Full Name", value: user.fullName },
                    { icon: Mail, label: "Email", value: user.email },
                    { icon: Phone, label: "Phone", value: user.phone || "Not provided" },
                    { icon: Shield, label: "Role", value: user.role, capitalize: true },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#f1f5f9] dark:hover:bg-[#22396F]/30 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f5f9] dark:bg-[#22396F] text-[#010736] dark:text-[#FCF1D0] border border-[#cbd5e1] dark:border-[#22396F] shrink-0">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-[#64748b] dark:text-[#cbd5e1]">{item.label}</p>
                        <p className={`text-sm font-medium truncate text-[#010736] dark:text-white ${item.capitalize ? "capitalize" : ""}`}>
                          {item.value}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <Button
            variant="outline"
            className="justify-start gap-3 h-auto py-4 px-4 border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#22396F]"
            onClick={() =>
              router.push(user.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard")
            }
          >
            <div className="h-8 w-8 rounded-lg bg-[#f1f5f9] dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F] flex items-center justify-center shrink-0 text-[#010736] dark:text-[#FCF1D0]">
              <Briefcase className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Dashboard</p>
              <p className="text-xs text-[#64748b] dark:text-[#cbd5e1]">View your activity</p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="justify-start gap-3 h-auto py-4 px-4 border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#22396F]"
            onClick={() => router.push("/jobs")}
          >
            <div className="h-8 w-8 rounded-lg bg-[#f1f5f9] dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F] flex items-center justify-center shrink-0 text-[#010736] dark:text-[#FCF1D0]">
              <Briefcase className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Browse Jobs</p>
              <p className="text-xs text-[#64748b] dark:text-[#cbd5e1]">Find opportunities</p>
            </div>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
