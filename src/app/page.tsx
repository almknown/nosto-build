"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Animated background gradient */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, var(--primary-start) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="text-8xl mb-6 animate-float">📼</div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Nostalgia</span> Playlist
            <br />
            Generator
          </h1>

          {/* Tagline */}
          <p
            className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
            style={{ color: "var(--foreground-muted)" }}
          >
            Rediscover forgotten gems from your favorite YouTube channels.
            Filter by year, find deep cuts, and relive the classics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/generate"
              className="btn-primary text-lg px-8 py-4 rounded-xl font-semibold"
            >
              Start Generating →
            </Link>
            <Link
              href="/login"
              className="glass-card px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-transform"
              style={{ border: "1px solid var(--border)" }}
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">∞</div>
              <div
                className="text-sm"
                style={{ color: "var(--foreground-muted)" }}
              >
                Channels
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">Free</div>
              <div
                className="text-sm"
                style={{ color: "var(--foreground-muted)" }}
              >
                3 playlists/day
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">Fast</div>
              <div
                className="text-sm"
                style={{ color: "var(--foreground-muted)" }}
              >
                Instant results
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4" style={{ background: "var(--background-card)" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Find a Channel</h3>
              <p style={{ color: "var(--foreground-muted)" }}>
                Search by handle or paste a channel URL. We'll index all
                their public videos.
              </p>
            </div>

            <div className="glass-card p-8 text-center">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-semibold mb-2">Set Your Filters</h3>
              <p style={{ color: "var(--foreground-muted)" }}>
                Choose a year range, add keywords, or enable "deep cuts" to
                find hidden gems.
              </p>
            </div>

            <div className="glass-card p-8 text-center">
              <div className="text-4xl mb-4">▶️</div>
              <h3 className="text-xl font-semibold mb-2">Watch on YouTube</h3>
              <p style={{ color: "var(--foreground-muted)" }}>
                Get a randomized playlist link that opens directly on
                YouTube. One click to nostalgia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ color: "var(--foreground-muted)" }}>
        <p>Built with ❤️ for YouTube nostalgia lovers</p>
      </footer>
    </main>
  );
}
