"use client";

import { useState } from "react";
import type { GeneratedPlaylistResponse } from "@/types";

interface PlaylistResultProps {
    playlist: GeneratedPlaylistResponse;
    onReset: () => void;
}

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatViewCount(count: string): string {
    const num = parseInt(count, 10);
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toString();
}

export default function PlaylistResult({ playlist, onReset }: PlaylistResultProps) {
    const [copied, setCopied] = useState(false);

    const copyLink = async () => {
        await navigator.clipboard.writeText(playlist.watchUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-4xl">
            {/* Header */}
            <div className="glass-card p-6 mb-6">
                <h2 className="text-2xl font-bold gradient-text mb-4">
                    🎉 Your Nostalgia Playlist is Ready!
                </h2>

                <div className="flex flex-wrap gap-3">
                    <a
                        href={playlist.watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                        </svg>
                        Watch on YouTube
                    </a>

                    <button className="btn-secondary flex items-center gap-2" onClick={copyLink}>
                        {copied ? (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                    />
                                </svg>
                                Copy Link
                            </>
                        )}
                    </button>

                    <button className="btn-secondary" onClick={onReset}>
                        Generate Another
                    </button>
                </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlist.videos.map((video, index) => (
                    <a
                        key={video.id}
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="video-card group"
                    >
                        <div className="relative aspect-video">
                            {video.thumbnailUrl ? (
                                <img
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <span className="text-4xl">🎬</span>
                                </div>
                            )}

                            {/* Play overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>

                            {/* Duration badge */}
                            <span
                                className="absolute bottom-2 right-2 px-2 py-0.5 text-xs font-medium rounded"
                                style={{ background: "rgba(0,0,0,0.8)" }}
                            >
                                {formatDuration(video.duration)}
                            </span>

                            {/* Index badge */}
                            <span
                                className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded"
                                style={{ background: "var(--primary-start)" }}
                            >
                                #{index + 1}
                            </span>
                        </div>

                        <div className="p-3">
                            <h4 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h4>
                            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground-muted)" }}>
                                <span>{formatViewCount(video.viewCount)} views</span>
                                <span>•</span>
                                <span>{new Date(video.publishedAt).getFullYear()}</span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
