"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  Briefcase,
  FileText,
  Video,
  Building2,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ThemeToggle from "@/components/shared/ThemeToggle";

interface NavUser {
  fullName: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<NavUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error("not authenticated");
        return r.json();
      })
      .then((d) => {
        const u = d.user || d.data?.user;
        if (u) setUser(u);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  };

  const navLinks = [
    { href: "/jobs", label: "Find Jobs", icon: Briefcase },
    { href: "/resume-parser", label: "AI Resume Parser", icon: FileText },
    ...(user
      ? user.role === "candidate"
        ? [
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/applications", label: "My Applications", icon: FileText },
            { href: "/interviews", label: "My Interviews", icon: Video },
          ]
        : [
            { href: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/recruiter/jobs", label: "Manage Jobs", icon: Briefcase },
            { href: "/recruiter/company", label: "Company", icon: Building2 },
          ]
      : [
          { href: "/#how-it-works", label: "How It Works", icon: Layers },
          { href: "/#features", label: "Features", icon: CheckCircle2 },
        ]),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#cbd5e1] dark:border-[#22396F] bg-white/95 dark:bg-[#010736]/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#0D1C42] border border-[#cbd5e1] dark:border-[#22396F] p-1 shadow-sm transition-transform group-hover:scale-105">
            <Image
              src="/logo-icon.png"
              alt="InterviewIQ Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain dark:hidden"
            />
            <Image
              src="/logo-icon-dark.png"
              alt="InterviewIQ Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain hidden dark:block"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#010736] dark:text-white">
            Interview<span className="text-[#22396F] dark:text-[#FCF1D0]">IQ</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === link.href
                  ? "bg-[#010736] dark:bg-[#22396F] text-[#FCF1D0]"
                  : "text-[#334155] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0] hover:bg-[#f1f5f9] dark:hover:bg-[#0D1C42]"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons / User Menu */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#0D1C42]">
                  <Avatar className="h-8 w-8 border border-[#cbd5e1] dark:border-[#22396F]">
                    <AvatarFallback className="bg-[#010736] dark:bg-[#22396F] text-[#FCF1D0] text-xs font-bold">
                      {user.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.fullName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#0D1C42] border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white shadow-xl">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-[#010736] dark:text-[#FCF1D0]">{user.fullName}</p>
                  <p className="text-xs text-[#475569] dark:text-[#cbd5e1]">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-[#cbd5e1] dark:bg-[#22396F]" />
                <DropdownMenuItem asChild className="hover:bg-[#f1f5f9] dark:hover:bg-[#22396F] cursor-pointer">
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#22396F] dark:text-[#FCF1D0]" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-[#f1f5f9] dark:hover:bg-[#22396F] cursor-pointer">
                  <Link
                    href={user.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard"}
                    className="flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#22396F] dark:text-[#FCF1D0]" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#cbd5e1] dark:bg-[#22396F]" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-[#010736] dark:text-white hover:text-[#010736] dark:hover:text-[#FCF1D0] hover:bg-[#f1f5f9] dark:hover:bg-[#0D1C42]">
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                asChild
                className="bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold shadow-sm transition-all"
              >
                <Link href="/signup">Sign Up Free</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#0D1C42]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#010736]">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? "bg-[#010736] dark:bg-[#22396F] text-[#FCF1D0]"
                    : "text-[#334155] dark:text-[#cbd5e1] hover:bg-[#f1f5f9] dark:hover:bg-[#0D1C42]"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#cbd5e1] dark:border-[#22396F]">
              {user ? (
                <Button variant="ghost" className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button variant="outline" asChild className="w-full border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#0D1C42]">
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button asChild className="w-full bg-[#010736] text-[#FCF1D0] dark:bg-[#FCF1D0] dark:text-[#010736] font-semibold">
                    <Link href="/signup">Sign Up Free</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
