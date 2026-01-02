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

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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

    return parts.length > 0 ? parts.join(" • ") : "No filters";
}

export default function HistoryPage() {
    const [playlists, setPlaylists] = useState<PlaylistHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    if (loading) {
        return (
            <main className="min-h-screen py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: "var(--primary-start)", borderTopColor: "transparent" }} />
                        <p className="mt-4" style={{ color: "var(--foreground-muted)" }}>Loading your playlists...</p>
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
                        <p className="text-lg mb-4" style={{ color: "var(--error)" }}>{error}</p>
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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Your Playlists</h1>
                        <p style={{ color: "var(--foreground-muted)" }}>
                            {playlists.length} playlist{playlists.length !== 1 ? "s" : ""} generated
                        </p>
                    </div>
                    <Link href="/generate" className="btn-primary">
                        + New Playlist
                    </Link>
                </div>

                {/* Empty state */}
                {playlists.length === 0 && (
                    <div className="glass-card p-12 text-center">
                        <div className="text-6xl mb-4">📼</div>
                        <h2 className="text-xl font-semibold mb-2">No playlists yet</h2>
                        <p className="mb-6" style={{ color: "var(--foreground-muted)" }}>
                            Generate your first nostalgic playlist to see it here!
                        </p>
                        <Link href="/generate" className="btn-primary">
                            Create Your First Playlist
                        </Link>
                    </div>
                )}

                {/* Playlist list */}
                <div className="space-y-4">
                    {playlists.map((playlist) => (
                        <div key={playlist.id} className="glass-card p-4 hover:scale-[1.01] transition-transform">
                            <div className="flex items-start gap-4">
                                {/* Channel thumbnail */}
                                <div className="flex-shrink-0">
                                    {playlist.channel?.thumbnailUrl ? (
                                        <img
                                            src={playlist.channel.thumbnailUrl}
                                            alt={playlist.channel.title}
                                            className="w-12 h-12 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                                            <span className="text-xl">🎬</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold truncate">
                                            {playlist.channel?.title || "Unknown Channel"}
                                        </h3>
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full"
                                            style={{ background: "var(--background-hover)" }}
                                        >
                                            {playlist.videoCount} videos
                                        </span>
                                    </div>

                                    <p className="text-sm truncate" style={{ color: "var(--foreground-muted)" }}>
                                        {formatFilters(playlist.filters)}
                                    </p>

                                    <p className="text-xs mt-1" style={{ color: "var(--foreground-muted)" }}>
                                        {formatDate(playlist.createdAt)}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 flex gap-2">
                                    <a
                                        href={playlist.watchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary text-sm px-4 py-2"
                                    >
                                        Watch
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
