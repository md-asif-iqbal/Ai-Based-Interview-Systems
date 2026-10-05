"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-xl border border-border bg-card opacity-50" />
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative h-9 w-9 rounded-xl border border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] hover:bg-[#f1f5f9] dark:hover:bg-[#22396F] text-[#010736] dark:text-[#FCF1D0] transition-colors cursor-pointer shadow-sm"
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-[#FCF1D0] transition-transform rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-[#010736] transition-transform rotate-0 scale-100" />
      )}
    </Button>
  );
}

export default ThemeToggle;

