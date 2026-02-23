import Link from "next/link";
import { Brain, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-accent text-primary-foreground">
                <Brain className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                SoftLanding
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered interview platform that makes hiring smarter, faster, and fairer.
            </p>
            <div className="flex gap-3">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="text-sm font-semibold mb-4">For Candidates</h4>
            <ul className="space-y-2.5">
              <li><Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Find Jobs</Link></li>
              <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Resume Tips</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Interview Prep</Link></li>
            </ul>
          </div>

          {/* For Recruiters */}
          <div>
            <h4 className="text-sm font-semibold mb-4">For Recruiters</h4>
            <ul className="space-y-2.5">
              <li><Link href="/recruiter/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Post a Job</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI Features</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © 2026 SoftLanding by Asif. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with 💙 using Next.js, MongoDB & Google Gemini AI
          </p>
        </div>
      </div>
    </footer>
  );
}
