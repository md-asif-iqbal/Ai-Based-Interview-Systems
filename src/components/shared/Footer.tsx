import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#cbd5e1] dark:border-[#22396F] bg-[#f8fafc] dark:bg-[#010736] text-[#010736] dark:text-white transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-[#0D1C42] border border-[#cbd5e1] dark:border-[#22396F] p-1 shadow-sm">
                <Image
                  src="/logo-icon.png"
                  alt="InterviewIQ Logo"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain dark:hidden"
                />
                <Image
                  src="/logo-icon-dark.png"
                  alt="InterviewIQ Logo"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain hidden dark:block"
                />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#010736] dark:text-white">
                Interview<span className="text-[#22396F] dark:text-[#FCF1D0]">IQ</span>
              </span>
            </Link>
            <p className="text-sm text-[#475569] dark:text-[#cbd5e1] leading-relaxed">
              AI-powered interview platform that makes hiring smarter, faster, and fairer with automated assessment.
            </p>
            <div className="flex gap-3">
              <Link href="#" className="h-8 w-8 rounded-lg bg-white dark:bg-[#0D1C42] border border-[#cbd5e1] dark:border-[#22396F] flex items-center justify-center text-[#334155] dark:text-[#cbd5e1] hover:text-[#FCF1D0] hover:bg-[#010736] dark:hover:bg-[#22396F] transition-colors">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" className="h-8 w-8 rounded-lg bg-white dark:bg-[#0D1C42] border border-[#cbd5e1] dark:border-[#22396F] flex items-center justify-center text-[#334155] dark:text-[#cbd5e1] hover:text-[#FCF1D0] hover:bg-[#010736] dark:hover:bg-[#22396F] transition-colors">
                <Github className="h-4 w-4" />
              </Link>
              <Link href="#" className="h-8 w-8 rounded-lg bg-white dark:bg-[#0D1C42] border border-[#cbd5e1] dark:border-[#22396F] flex items-center justify-center text-[#334155] dark:text-[#cbd5e1] hover:text-[#FCF1D0] hover:bg-[#010736] dark:hover:bg-[#22396F] transition-colors">
                <Linkedin className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="text-sm font-semibold text-[#010736] dark:text-[#FCF1D0] mb-4">For Candidates</h4>
            <ul className="space-y-2.5">
              <li><Link href="/jobs" className="text-sm text-[#475569] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0] transition-colors">Find Jobs</Link></li>
              <li><Link href="/resume-parser" className="text-sm text-[#475569] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0] transition-colors">AI Resume Parser</Link></li>
              <li><Link href="/dashboard" className="text-sm text-[#475569] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0] transition-colors">Candidate Dashboard</Link></li>
              <li><Link href="/interviews" className="text-sm text-[#475569] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0] transition-colors">My Interviews</Link></li>
            </ul>
          </div>

          {/* For Recruiters */}
          <div>
            <h4 className="text-sm font-semibold text-[#010736] dark:text-[#FCF1D0] mb-4">For Recruiters</h4>
            <ul className="space-y-2.5">
              <li><Link href="/recruiter/dashboard" className="text-sm text-[#475569] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0] transition-colors">Recruiter Dashboard</Link></li>
              <li><Link href="/recruiter/jobs" className="text-sm text-[#475569] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0] transition-colors">Manage Job Posts</Link></li>
              <li><Link href="/resume-parser" className="text-sm text-[#475569] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0] transition-colors">AI Resume Screener</Link></li>
              <li><Link href="/recruiter/company" className="text-sm text-[#475569] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0] transition-colors">Company Profile</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-[#010736] dark:text-[#FCF1D0] mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><Link href="#" className="text-sm text-[#475569] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0] transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-sm text-[#475569] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0] transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-[#475569] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0] transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-[#475569] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0] transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#cbd5e1] dark:border-[#22396F] py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#475569] dark:text-[#cbd5e1]">
            © 2026 InterviewIQ. Developed by <span className="font-semibold text-[#010736] dark:text-[#FCF1D0]">Asif Iqbal</span>. All rights reserved.
          </p>
          <p className="text-xs text-[#475569] dark:text-[#cbd5e1]">
            Engineered by <span className="font-semibold text-[#010736] dark:text-[#FCF1D0]">Asif Iqbal</span> with Next.js, MongoDB Atlas & Google Gemini AI
          </p>
        </div>
      </div>
    </footer>
  );
}

