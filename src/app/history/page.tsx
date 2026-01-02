"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PlaylistHistoryItem {
    id: string;
    name: string | null;
    videoIds: string[];
    filters: {
        yearStart?: number;
        yearEnd?: number;
        keywords?: string[];
        deepCuts?: boolean;
    };
    watchUrl: string;
    channelId: string;
    createdAt: string;
    channel: {
        youtubeId: string;
        title: string;
        thumbnailUrl: string | null;
    } | null;
    videoCount: number;
}

type SortOption = "newest" | "oldest" | "channel";

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatFilters(filters: PlaylistHistoryItem["filters"]): string {
    const parts: string[] = [];

    if (filters.yearStart || filters.yearEnd) {
        parts.push(`${filters.yearStart || "?"} - ${filters.yearEnd || "?"}`);
    }
    if (filters.keywords?.length) {
        parts.push(filters.keywords.join(", "));
    }
    if (filters.deepCuts) {
        parts.push("Deep Cuts");
    }

    return parts.length > 0 ? parts.join(" • ") : "Random selection";
}

export default function HistoryPage() {
    const [playlists, setPlaylists] = useState<PlaylistHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const res = await fetch("/api/playlists");
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to load history");
                }

                setPlaylists(data.playlists);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load history");
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, []);

    const sortedPlaylists = [...playlists].sort((a, b) => {
        switch (sortBy) {
            case "newest":
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case "oldest":
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case "channel":
                return (a.channel?.title || "").localeCompare(b.channel?.title || "");
            default:
                return 0;
        }
    });

    const copyLink = async (url: string, id: string) => {
        await navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const deletePlaylist = async (id: string) => {
        if (!confirm("Delete this playlist from your history?")) return;

        try {
            const res = await fetch(`/api/playlists/${id}`, { method: "DELETE" });
            if (res.ok) {
                setPlaylists((prev) => prev.filter((p) => p.id !== id));
            }
        } catch (e) {
            console.error("Failed to delete playlist", e);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                        <div
                            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
                            style={{ borderColor: "var(--primary-start)", borderTopColor: "transparent" }}
                        />
                        <p className="mt-4" style={{ color: "var(--foreground-muted)" }}>
                            Loading your playlists...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card p-8 text-center">
                        <p className="text-lg mb-4" style={{ color: "var(--error)" }}>
                            {error}
                        </p>
                        <Link href="/generate" className="btn-primary">
                            Generate a Playlist
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text-logo">Your Playlists</h1>
                        <p style={{ color: "var(--foreground-muted)" }}>
                            {playlists.length} playlist{playlists.length !== 1 ? "s" : ""} generated
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="input py-2 text-sm"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="channel">Channel A-Z</option>
                        </select>
                        <Link
                            href="/generate"
                            className="px-5 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all hover:scale-105"
                            style={{
                                background: "linear-gradient(135deg, var(--primary-start), var(--primary-end))",
                                boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Playlist
                        </Link>
                    </div>
                </div>

                {/* Empty state */}
                {playlists.length === 0 && (
                    <div className="glass-card p-12 text-center relative overflow-hidden">
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{
                                background: "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.2), transparent 60%)",
                            }}
                        />
                        <div className="relative">
                            <div className="text-7xl mb-6">📼</div>
                            <h2 className="text-2xl font-bold mb-3">No playlists yet</h2>
                            <p className="mb-8 max-w-md mx-auto" style={{ color: "var(--foreground-muted)" }}>
                                Generate your first nostalgic playlist and it will appear here for easy access!
                            </p>
                            <Link
                                href="/generate"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
                                style={{
                                    background: "linear-gradient(135deg, var(--primary-start), var(--primary-end))",
                                    boxShadow: "0 8px 32px rgba(99, 102, 241, 0.4)",
                                }}
                            >
                                ✨ Create Your First Playlist
                            </Link>
                        </div>
                    </div>
                )}

                {/* Playlist list */}
                <div className="space-y-4">
                    {sortedPlaylists.map((playlist) => (
                        <div
                            key={playlist.id}
                            className="glass-card p-5 hover:border-[var(--primary-start)] transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                {/* Channel thumbnail */}
                                <div className="flex-shrink-0">
                                    {playlist.channel?.thumbnailUrl ? (
                                        <img
                                            src={playlist.channel.thumbnailUrl}
                                            alt={playlist.channel.title}
                                            className="w-14 h-14 rounded-full ring-2 ring-[var(--border)] group-hover:ring-[var(--primary-start)] transition-all"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
                                            <span className="text-2xl">🎬</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-semibold text-lg truncate">
                                            {playlist.channel?.title || "Unknown Channel"}
                                        </h3>
                                        <span
                                            className="text-xs px-2.5 py-1 rounded-full font-medium"
                                            style={{ background: "linear-gradient(135deg, var(--primary-start), var(--primary-end))" }}
                                        >
                                            {playlist.videoCount} videos
                                        </span>
                                    </div>

                                    <p className="text-sm truncate mb-2" style={{ color: "var(--foreground-muted)" }}>
                                        {formatFilters(playlist.filters)}
                                    </p>

                                    <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                                        Created {formatDate(playlist.createdAt)}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 flex gap-2">
                                    <a
                                        href={playlist.watchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all hover:scale-105"
                                        style={{
                                            background: "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)",
                                        }}
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                        <span className="hidden sm:inline">Watch</span>
                                    </a>
                                    <button
                                        onClick={() => copyLink(playlist.watchUrl, playlist.id)}
                                        className="p-2 rounded-lg transition-all hover:bg-[var(--background-hover)]"
                                        style={{ border: "1px solid var(--border)" }}
                                        title="Copy link"
                                    >
                                        {copiedId === playlist.id ? (
                                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => deletePlaylist(playlist.id)}
                                        className="p-2 rounded-lg transition-all hover:bg-red-500/10"
                                        style={{ border: "1px solid rgba(239, 68, 68, 0.3)" }}
                                        title="Delete"
                                    >
                                        <svg className="w-4 h-4" style={{ color: "var(--error)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
