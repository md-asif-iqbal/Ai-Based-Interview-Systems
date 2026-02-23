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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/3">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-6 gap-2"
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
          <Card className="mb-6 overflow-hidden border-border/40">
            <div className="h-24 sm:h-32 bg-gradient-to-r from-primary/15 via-accent/10 to-purple-500/15 relative">
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 30% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)",
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>
            <CardContent className="pt-0 pb-6 px-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 sm:-mt-10">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                    {user.profilePicture ? (
                      <AvatarImage src={user.profilePicture} alt={user.fullName} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-background border-2 border-border flex items-center justify-center">
                    <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-center sm:text-left flex-1 pb-1">
                  <h1 className="text-xl sm:text-2xl font-bold">{user.fullName}</h1>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <Badge className="capitalize bg-primary/10 text-primary border-primary/20">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {user.role}
                    </Badge>
                    <Badge variant="outline" className="text-green-600 border-green-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(!editing)}
                  className="gap-2 shrink-0"
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
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                {editing ? "Edit Profile" : "Profile Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-3">
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2"
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
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className={`text-sm font-medium truncate ${item.capitalize ? "capitalize" : ""}`}>
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
            className="justify-start gap-3 h-auto py-4 px-4"
            onClick={() =>
              router.push(user.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard")
            }
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Dashboard</p>
              <p className="text-xs text-muted-foreground">View your activity</p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="justify-start gap-3 h-auto py-4 px-4"
            onClick={() => router.push("/jobs")}
          >
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Briefcase className="h-4 w-4 text-accent" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Browse Jobs</p>
              <p className="text-xs text-muted-foreground">Find opportunities</p>
            </div>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
