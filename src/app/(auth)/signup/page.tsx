"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/config";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    role: z.enum(["candidate", "recruiter"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"candidate" | "recruiter">("candidate");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "candidate" },
  });

  const password = watch("password", "");

  const handleRoleChange = (v: string) => {
    const r = v as "candidate" | "recruiter";
    setSelectedRole(r);
    setValue("role", r);
  };

  const getPasswordStrength = (pwd: string) => {
    let s = 0;
    if (pwd.length >= 6) s++;
    if (pwd.length >= 10) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };
  const strength = getPasswordStrength(password);
  const strengthColors = ["bg-[#22396F]/40", "bg-[#22396F]/60", "bg-[#22396F]", "bg-[#FCF1D0]/80", "bg-[#FCF1D0]"];
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Signup failed");
        return;
      }

      toast.success("Account created successfully!");
      router.push(data.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: firebaseUser.email,
          fullName: firebaseUser.displayName,
          photoUrl: firebaseUser.photoURL,
          uid: firebaseUser.uid,
          role: selectedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Google sign-up failed");
        return;
      }

      toast.success("Account created with Google!");
      const user = data.data?.user;
      if (user?.role === "recruiter") {
        window.location.href = "/recruiter/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === "auth/popup-closed-by-user") return;
      if (err.code === "auth/unauthorized-domain") {
        toast.error("Firebase Authorized Domain Error: Add this domain in Firebase Console -> Authentication -> Settings -> Authorized domains");
        return;
      }
      toast.error(err.message || "Google sign-up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-[#f8fafc] dark:bg-[#010736] text-[#010736] dark:text-white transition-colors duration-200">
      <Card className="w-full max-w-lg border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white shadow-xl">
        <CardHeader className="text-center pb-2 pt-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F] p-1.5 shadow-sm">
              <Image
                src="/logo-icon.png"
                alt="InterviewIQ Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain dark:hidden"
              />
              <Image
                src="/logo-icon-dark.png"
                alt="InterviewIQ Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain hidden dark:block"
              />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-[#010736] dark:text-white">Create your account</h1>
          <p className="text-sm text-[#64748b] dark:text-[#cbd5e1] mt-1">Start your AI-powered interview journey</p>
        </CardHeader>
        <CardContent className="px-6 pb-8 pt-4">
          {/* Role Selection */}
          <div className="space-y-2 mb-5">
            <Label className="text-sm font-medium text-[#010736] dark:text-white">I am a</Label>
            <RadioGroup
              value={selectedRole}
              onValueChange={handleRoleChange}
              className="grid grid-cols-2 gap-3"
            >
              <label
                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition-all text-sm font-medium ${
                  selectedRole === "candidate"
                    ? "border-[#010736] bg-[#010736] text-[#FCF1D0] dark:border-[#FCF1D0] dark:bg-[#22396F] dark:text-[#FCF1D0]"
                    : "border-[#cbd5e1] bg-white text-[#475569] hover:border-[#22396F] dark:border-[#22396F] dark:bg-[#010736] dark:text-[#cbd5e1] dark:hover:border-[#FCF1D0]"
                }`}
              >
                <RadioGroupItem value="candidate" className="sr-only" />
                <User className="h-4 w-4" />
                Candidate
              </label>
              <label
                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition-all text-sm font-medium ${
                  selectedRole === "recruiter"
                    ? "border-[#010736] bg-[#010736] text-[#FCF1D0] dark:border-[#FCF1D0] dark:bg-[#22396F] dark:text-[#FCF1D0]"
                    : "border-[#cbd5e1] bg-white text-[#475569] hover:border-[#22396F] dark:border-[#22396F] dark:bg-[#010736] dark:text-[#cbd5e1] dark:hover:border-[#FCF1D0]"
                }`}
              >
                <RadioGroupItem value="recruiter" className="sr-only" />
                <Briefcase className="h-4 w-4" />
                Recruiter
              </label>
            </RadioGroup>
          </div>

          {/* Google Sign-Up */}
          <Button
            type="button"
            variant="outline"
            disabled={googleLoading}
            onClick={handleGoogleSignUp}
            className="w-full h-11 gap-3 mb-4 border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#010736] text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#22396F] hover:text-[#010736] dark:hover:text-[#FCF1D0] transition-all"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {googleLoading ? "Creating account..." : `Sign up with Google as ${selectedRole === "recruiter" ? "Recruiter" : "Candidate"}`}
          </Button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#cbd5e1] dark:border-[#22396F]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#0D1C42] px-3 text-[#64748b] dark:text-[#cbd5e1]">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-[#010736] dark:text-white">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b] dark:text-[#cbd5e1]" />
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  className="pl-10 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white placeholder:text-[#94a3b8] focus:border-[#22396F] dark:focus:border-[#FCF1D0]"
                  {...register("fullName")}
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#010736] dark:text-white">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b] dark:text-[#cbd5e1]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white placeholder:text-[#94a3b8] focus:border-[#22396F] dark:focus:border-[#FCF1D0]"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[#010736] dark:text-white">Phone (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b] dark:text-[#cbd5e1]" />
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  className="pl-10 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white placeholder:text-[#94a3b8] focus:border-[#22396F] dark:focus:border-[#FCF1D0]"
                  {...register("phone")}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#010736] dark:text-white">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b] dark:text-[#cbd5e1]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white placeholder:text-[#94a3b8] focus:border-[#22396F] dark:focus:border-[#FCF1D0]"
                  {...register("password")}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0]" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : "bg-[#cbd5e1] dark:bg-[#22396F]"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-[#64748b] dark:text-[#cbd5e1]">{strengthLabels[strength - 1] || "Too short"}</p>
                </div>
              )}
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-[#010736] dark:text-white">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b] dark:text-[#cbd5e1]" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white placeholder:text-[#94a3b8] focus:border-[#22396F] dark:focus:border-[#FCF1D0]"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold transition-all shadow-md mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-[#64748b] dark:text-[#cbd5e1] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#010736] dark:text-[#FCF1D0] font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
