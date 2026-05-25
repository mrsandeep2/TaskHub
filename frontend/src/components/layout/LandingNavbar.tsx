"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Menu, X } from "lucide-react";
import { cn } from "@/utils/cn";

export function LandingNavbar() {

  const navItems = [
    { id: "features", label: "Features" },
    { id: "workflow", label: "How It Works" },
    { id: "ai-studio", label: "AI Studio" },
  ];
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("features");
  const [hovered, setHovered] = useState<string | null>(null);
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const underlineRef = useRef<HTMLDivElement | null>(null);

  // Scroll spy logic
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      let found = false;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const section = document.getElementById(navItems[i].id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 80) {
            setActive(navItems[i].id);
            found = true;
            break;
          }
        }
      }
      if (!found) setActive(navItems[0].id);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Underline animation
  useEffect(() => {
    if (!underlineRef.current) return;
    const idx = navItems.findIndex((item) => item.id === (hovered || active));
    const el = navRefs.current[idx];
    if (el && underlineRef.current) {
      const rect = el.getBoundingClientRect();
      const parentRect = el.parentElement!.getBoundingClientRect();
      underlineRef.current.style.left = `${rect.left - parentRect.left}px`;
      underlineRef.current.style.width = `${rect.width}px`;
      underlineRef.current.style.opacity = "1";
    } else if (underlineRef.current) {
      underlineRef.current.style.opacity = "0";
    }
  }, [active, hovered]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">TaskHub</span>
        </Link>

        <nav className="hidden md:flex relative items-center gap-6 text-sm text-muted-foreground">
          {navItems.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              ref={el => { navRefs.current[i] = el; }}
              className={cn(
                "relative px-1 py-0.5 cursor-pointer transition-colors",
                active === item.id && "text-primary font-semibold",
                hovered === item.id && "text-foreground"
              )}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              onTouchStart={() => setHovered(item.id)}
              onTouchEnd={() => setHovered(null)}
            >
              {item.label}
            </a>
          ))}
          {/* Animated underline */}
          <motion.div
            ref={underlineRef}
            className="absolute bottom-0 h-0.5 bg-primary rounded-full"
            style={{ left: 0, width: 0, opacity: 0, transition: 'all 0.3s cubic-bezier(.4,0,.2,1)' }}
            aria-hidden="true"
          />
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
          >
            Get Started
          </Link>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl px-6 py-4 space-y-3"
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-muted-foreground hover:text-foreground py-1 capitalize transition-colors"
            >
              {item.label}
            </a>
          ))}
        </motion.div>
      )}
    </header>
  );
}
