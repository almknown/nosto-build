"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NosLogo from "@/components/nosbot-logo";

interface AccountStats {
    totalPlaylists: number;
    totalVideos: number;
    memberSince: string;
}

export default function AccountPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<AccountStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Fetch user stats
    useEffect(() => {
        async function fetchStats() {
            if (!session) return;

            try {
                const res = await fetch("/api/playlists");
                if (res.ok) {
                    const data = await res.json();
                    const playlists = data.playlists || [];
                    const totalVideos = playlists.reduce(
                        (sum: number, p: { videoCount: number }) => sum + p.videoCount,
                        0
                    );

                    setStats({
                        totalPlaylists: playlists.length,
                        totalVideos,
                        memberSince: new Date().toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                        }),
                    });
                }
            } catch (e) {
                console.error("Failed to fetch stats", e);
            } finally {
                setLoading(false);
            }
        }

        if (session) {
            fetchStats();
        }
    }, [session]);

    if (status === "loading" || (status === "authenticated" && loading)) {
        return (
            <main className="min-h-screen py-12 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
                        style={{ borderColor: "var(--primary-start)", borderTopColor: "transparent" }}
                    />
                    <p className="mt-4" style={{ color: "var(--foreground-muted)" }}>
                        Loading your account...
                    </p>
                </div>
            </main>
        );
    }

    if (!session) {
        return null; // Will redirect
    }

    return (
        <main className="min-h-screen py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Profile Header */}
                <div className="glass-card p-8 mb-6 relative overflow-hidden">
                    {/* Background accent */}
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            background: "radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.2), transparent 60%)",
                        }}
                    />

                    <div className="relative flex items-center gap-6">
                        {/* Avatar */}
                        {session.user?.image ? (
                            <img
                                src={session.user.image}
                                alt={session.user.name || "User"}
                                className="w-20 h-20 rounded-full ring-4 ring-[var(--primary-start)] ring-offset-4 ring-offset-[var(--background-card)]"
                            />
                        ) : (
                            <div
                                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ring-4 ring-[var(--primary-start)] ring-offset-4 ring-offset-[var(--background-card)]"
                                style={{ background: "linear-gradient(135deg, var(--primary-start), var(--primary-end))" }}
                            >
                                {session.user?.name?.[0] || "U"}
                            </div>
                        )}

                        <div className="flex-1">
                            <h1 className="text-2xl font-bold mb-1">{session.user?.name || "User"}</h1>
                            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                                {session.user?.email}
                            </p>
                            {stats?.memberSince && (
                                <p className="text-xs mt-2" style={{ color: "var(--foreground-muted)" }}>
                                    Member since {stats.memberSince}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="glass-card p-6 text-center">
                        <div className="text-3xl font-bold gradient-text-logo mb-1">
                            {stats?.totalPlaylists ?? "—"}
                        </div>
                        <div className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                            Playlists Created
                        </div>
                    </div>
                    <div className="glass-card p-6 text-center">
                        <div className="text-3xl font-bold gradient-text-logo mb-1">
                            {stats?.totalVideos ?? "—"}
                        </div>
                        <div className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                            Videos Curated
                        </div>
                    </div>
                    <div className="glass-card p-6 text-center col-span-2 md:col-span-1">
                        <div className="text-2xl font-bold mb-1" style={{ color: "#10b981" }}>
                            Free
                        </div>
                        <div className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                            Current Plan
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                    <Link
                        href="/generate"
                        className="glass-card p-5 flex items-center justify-between group hover:border-[var(--primary-start)] transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                                style={{ background: "rgba(99, 102, 241, 0.2)" }}
                            >
                                ✨
                            </div>
                            <div>
                                <h3 className="font-semibold">Create New Playlist</h3>
                                <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                                    Start curating videos
                                </p>
                            </div>
                        </div>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>

                    <Link
                        href="/history"
                        className="glass-card p-5 flex items-center justify-between group hover:border-[var(--primary-start)] transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                                style={{ background: "rgba(139, 92, 246, 0.2)" }}
                            >
                                📚
                            </div>
                            <div>
                                <h3 className="font-semibold">View History</h3>
                                <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                                    Browse past playlists
                                </p>
                            </div>
                        </div>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>

                    <Link
                        href="/settings"
                        className="glass-card p-5 flex items-center justify-between group hover:border-[var(--primary-start)] transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                                style={{ background: "rgba(16, 185, 129, 0.2)" }}
                            >
                                ⚙️
                            </div>
                            <div>
                                <h3 className="font-semibold">Settings</h3>
                                <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                                    Preferences & data
                                </p>
                            </div>
                        </div>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                {/* Sign Out */}
                <div className="mt-8 pt-8 border-t" style={{ borderColor: "var(--border)" }}>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full py-4 rounded-xl font-medium text-center transition-all hover:bg-red-500/10"
                        style={{ color: "var(--error)", border: "1px solid rgba(239, 68, 68, 0.3)" }}
                    >
                        Sign Out
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <NosLogo size="sm" />
                </div>
            </div>
        </main>
    );
}
