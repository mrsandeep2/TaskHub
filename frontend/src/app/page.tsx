"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, ArrowRight, CheckCircle, Users, BarChart3, Layers, Mail, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">TaskHub</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#workflow" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#ai-studio" className="hover:text-foreground transition-colors">AI Studio</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all hover:shadow-md"
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-indigo-600/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6 max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 text-xs font-medium text-violet-700 dark:text-violet-400">
              <Star className="h-3.5 w-3.5" /> AI-Powered Product Photography Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight">
              Transform products into{" "}
              <span className="gradient-text">studio-quality</span> photos
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              TaskHub combines intelligent task management with AI product photography.
              Assign, generate, review — at scale.
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-0.5"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-xl border border-border font-semibold hover:bg-accent transition-all"
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="glass-card p-4 max-w-4xl mx-auto">
              <div className="flex items-center gap-1.5 mb-3">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <div className="ml-4 h-5 flex-1 max-w-xs rounded bg-muted" />
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Total Tasks", value: "248", color: "from-violet-500/20 to-purple-500/20" },
                  { label: "Accepted", value: "183", color: "from-green-500/20 to-emerald-500/20" },
                  { label: "In Review", value: "31", color: "from-orange-500/20 to-amber-500/20" },
                  { label: "AI Generations", value: "1,492", color: "from-blue-500/20 to-cyan-500/20" },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-xl p-3 bg-gradient-to-br ${stat.color}`}>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["White BG", "Theme Scene", "Model Wear"].map((type) => (
                  <div key={type} className="aspect-video rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-medium">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold tracking-tight">Everything you need</h2>
          <p className="text-muted-foreground mt-2">Built for product photography workflows, end to end.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Layers, title: "Task Management", desc: "Create, assign, and track product photography tasks through a clear status workflow.", color: "text-violet-600" },
            { icon: Zap, title: "AI Photography Studio", desc: "Generate 8 precise images per product: white backgrounds, themed scenes, and model shots.", color: "text-blue-600" },
            { icon: CheckCircle, title: "Admin Review Workflow", desc: "Compare original vs generated, accept or request revisions with a single click.", color: "text-green-600" },
            { icon: Users, title: "Team Management", desc: "Manage users, track activity, and monitor productivity across your team.", color: "text-orange-600" },
            { icon: Mail, title: "Email Notifications", desc: "Automated emails for task assignments, submissions, and acceptances via Resend.", color: "text-pink-600" },
            { icon: BarChart3, title: "Analytics Dashboard", desc: "Track completion trends, generation usage, and team productivity in real time.", color: "text-cyan-600" },
          ].map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`h-10 w-10 rounded-xl bg-current/10 flex items-center justify-center mb-4 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="workflow" className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-display font-bold tracking-tight mb-12">How it works</h2>
          <div className="grid md:grid-cols-5 gap-4 items-center">
            {[
              { step: "1", label: "Admin creates task", sub: "Upload product image" },
              { step: "→", label: "", sub: "" },
              { step: "2", label: "User generates images", sub: "8 AI-powered shots" },
              { step: "→", label: "", sub: "" },
              { step: "3", label: "Admin reviews & accepts", sub: "Or requests revision" },
            ].map(({ step, label, sub }, i) =>
              step === "→" ? (
                <div key={i} className="text-2xl text-muted-foreground hidden md:flex justify-center">→</div>
              ) : (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-5 text-center"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">
                    {step}
                  </div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-12 bg-gradient-to-br from-violet-600/10 via-transparent to-indigo-600/10"
        >
          <h2 className="text-3xl font-display font-bold tracking-tight mb-4">
            Ready to transform your workflow?
          </h2>
          <p className="text-muted-foreground mb-8">
            Start generating premium product photos with AI today.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 h-12 px-10 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="font-display font-bold text-sm">TaskHub</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2024 TaskHub. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
