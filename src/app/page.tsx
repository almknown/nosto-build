"use client";

import Link from "next/link";
import NosLogo from "@/components/nosbot-logo";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Particle wave background */}
        <div className="particle-wave-bg" />

        {/* Additional gradient orbs */}
        <div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }}
        />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <NosLogo size="xl" showText={false} />
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter">
            <span className="gradient-text-logo">NosBot</span>
          </h1>

          {/* Tagline - Updated */}
          <p
            className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Rediscover your favorite YouTube moments
          </p>

          {/* CTA Buttons - Redesigned */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/generate"
              className="group relative px-10 py-4 rounded-full font-semibold text-lg min-w-[220px] overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
                boxShadow: "0 8px 32px rgba(139, 92, 246, 0.4)",
              }}
            >
              <span className="relative z-10 text-white flex items-center justify-center gap-2">
                Get Started
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              {/* Shine effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                  transform: "translateX(-100%)",
                  animation: "shine 0.75s ease-in-out forwards",
                }}
              />
            </Link>
            <Link
              href="/login"
              className="px-10 py-4 rounded-full font-semibold text-lg min-w-[220px] border-2 transition-all duration-300 hover:bg-white/5 hover:border-[var(--primary-start)]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              Sign In
            </Link>
          </div>

          {/* Stats - Redesigned */}
          <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text-logo mb-1">AI</div>
              <div className="text-sm tracking-widest uppercase" style={{ color: "var(--foreground-muted)" }}>Powered</div>
            </div>
            <div className="hidden sm:block w-px h-12" style={{ background: "var(--border)" }} />
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text-logo mb-1">Any</div>
              <div className="text-sm tracking-widest uppercase" style={{ color: "var(--foreground-muted)" }}>Channel</div>
            </div>
            <div className="hidden sm:block w-px h-12" style={{ background: "var(--border)" }} />
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text-logo mb-1">Pro</div>
              <div className="text-sm tracking-widest uppercase" style={{ color: "var(--foreground-muted)" }}>Curation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <section className="py-24 px-4 relative" style={{ background: "var(--background-card)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--foreground-muted)" }}>
              Three simple steps to unlock your nostalgia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="glass-card p-8 text-center group hover:scale-[1.03] transition-all duration-300 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.1), transparent 60%)",
                }}
              />
              <div className="relative z-10">
                <div
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))" }}
                >
                  🔍
                </div>
                <h3 className="text-xl font-semibold mb-3">Find a Channel</h3>
                <p style={{ color: "var(--foreground-muted)" }} className="leading-relaxed">
                  Search for any YouTube creator. We'll index their entire video library instantly.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-card p-8 text-center group hover:scale-[1.03] transition-all duration-300 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.1), transparent 60%)",
                }}
              />
              <div className="relative z-10">
                <div
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2))" }}
                >
                  ⚙️
                </div>
                <h3 className="text-xl font-semibold mb-3">Set Your Filters</h3>
                <p style={{ color: "var(--foreground-muted)" }} className="leading-relaxed">
                  Pick a year range, duration, or describe what you're looking for with AI.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-card p-8 text-center group hover:scale-[1.03] transition-all duration-300 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.1), transparent 60%)",
                }}
              />
              <div className="relative z-10">
                <div
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.2))" }}
                >
                  ▶️
                </div>
                <h3 className="text-xl font-semibold mb-3">Watch Instantly</h3>
                <p style={{ color: "var(--foreground-muted)" }} className="leading-relaxed">
                  Get a curated playlist that opens directly on YouTube. No ads, no friction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 text-center border-t" style={{ borderColor: "var(--border)", color: "var(--foreground-muted)" }}>
        <div className="flex justify-center mb-4">
          <NosLogo size="sm" />
        </div>
        <p className="text-sm">© {new Date().getFullYear()} NosBot. All rights reserved.</p>
      </footer>
    </main>
  );
}
