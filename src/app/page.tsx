"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Animated background gradient */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, var(--primary-start) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Logo / Icon */}
          <div className="text-7xl mb-8 animate-float inline-block filter drop-shadow-2xl">
            ✨
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tighter">
            <span className="gradient-text">NosBot</span>
          </h1>

          {/* Tagline */}
          <p
            className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed text-balance"
            style={{ color: "var(--foreground-muted)" }}
          >
            The intelligent curator for YouTube history. <br />
            Rediscover content with precision AI filtering.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link
              href="/generate"
              className="btn-primary text-lg px-10 py-4 rounded-full font-semibold min-w-[200px]"
            >
              Launch App
            </Link>
            <Link
              href="/login"
              className="px-10 py-4 rounded-full font-semibold border border-[var(--border)] hover:bg-[var(--background-hover)] transition-colors min-w-[200px]"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-12 max-w-2xl mx-auto border-t pt-10" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-1">AI</div>
              <div className="text-sm tracking-wide uppercase opacity-60">Powered</div>
            </div>
            <div className="text-center border-l border-r" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="text-3xl font-bold gradient-text mb-1">Any</div>
              <div className="text-sm tracking-wide uppercase opacity-60">Channel</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-1">Pro</div>
              <div className="text-sm tracking-wide uppercase opacity-60">Curation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4" style={{ background: "var(--background-card)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-10 text-center hover:scale-[1.02] transition-transform duration-300">
              <div className="text-4xl mb-6 opacity-80">🔭</div>
              <h3 className="text-xl font-semibold mb-3">Deep Search</h3>
              <p style={{ color: "var(--foreground-muted)" }} className="leading-relaxed">
                Our AI engine scans full channel archives to surface content that traditional search misses.
              </p>
            </div>

            <div className="glass-card p-10 text-center hover:scale-[1.02] transition-transform duration-300">
              <div className="text-4xl mb-6 opacity-80">⚖️</div>
              <h3 className="text-xl font-semibold mb-3">Precision Filters</h3>
              <p style={{ color: "var(--foreground-muted)" }} className="leading-relaxed">
                Filter by era, duration, and context. NosBot distinguishes between generic themes and specific requests.
              </p>
            </div>

            <div className="glass-card p-10 text-center hover:scale-[1.02] transition-transform duration-300">
              <div className="text-4xl mb-6 opacity-80">⚡</div>
              <h3 className="text-xl font-semibold mb-3">Instant Playlists</h3>
              <p style={{ color: "var(--foreground-muted)" }} className="leading-relaxed">
                Generate curated watch queues that open directly on YouTube. No ads, no interruptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 text-center border-t" style={{ borderColor: "var(--border)", color: "var(--foreground-muted)" }}>
        <p className="text-sm">© {new Date().getFullYear()} NosBot. All rights reserved.</p>
      </footer>
    </main>
  );
}
