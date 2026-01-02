"use client";

import { useState, useRef } from "react";
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

function formatTotalDuration(videos: { duration: number }[]): string {
    const totalSeconds = videos.reduce((sum, v) => sum + v.duration, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
}

export default function PlaylistResult({ playlist, onReset }: PlaylistResultProps) {
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);

    const copyLink = async () => {
        await navigator.clipboard.writeText(playlist.watchUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const saveToHistory = () => {
        // This is auto-saved via the API, but we show confirmation
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const scrollCarousel = (direction: "left" | "right") => {
        if (carouselRef.current) {
            const scrollAmount = carouselRef.current.clientWidth * 0.8;
            carouselRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="w-full max-w-5xl">
            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">Playlist Created</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold gradient-text-logo mb-2">
                    Your Nostalgia Playlist is Ready!
                </h2>
                <p className="text-lg" style={{ color: "var(--foreground-muted)" }}>
                    {playlist.videos.length} videos curated just for you
                </p>
            </div>

            {/* Stats Summary Card */}
            <div className="glass-card p-6 mb-8">
                <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                    <div className="text-center">
                        <div className="text-3xl font-bold gradient-text-logo">{playlist.videos.length}</div>
                        <div className="text-sm" style={{ color: "var(--foreground-muted)" }}>Videos</div>
                    </div>
                    <div className="hidden sm:block w-px h-12" style={{ background: "var(--border)" }} />
                    <div className="text-center">
                        <div className="text-3xl font-bold gradient-text-logo">{formatTotalDuration(playlist.videos)}</div>
                        <div className="text-sm" style={{ color: "var(--foreground-muted)" }}>Total Duration</div>
                    </div>
                    <div className="hidden sm:block w-px h-12" style={{ background: "var(--border)" }} />
                    <div className="text-center">
                        <div className="text-3xl font-bold gradient-text-logo">
                            {playlist.videos.length > 0 ? new Date(playlist.videos[0].publishedAt).getFullYear() : "—"}
                            {playlist.videos.length > 1 && playlist.videos[0].publishedAt !== playlist.videos[playlist.videos.length - 1].publishedAt && (
                                <span> - {new Date(playlist.videos[playlist.videos.length - 1].publishedAt).getFullYear()}</span>
                            )}
                        </div>
                        <div className="text-sm" style={{ color: "var(--foreground-muted)" }}>Year Range</div>
                    </div>
                </div>
            </div>

            {/* Video Carousel */}
            <div className="relative mb-8">
                {/* Carousel Navigation */}
                <button
                    onClick={() => scrollCarousel("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 -ml-4 md:-ml-6"
                    style={{
                        background: "var(--background-card)",
                        border: "1px solid var(--border)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    }}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    onClick={() => scrollCarousel("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 -mr-4 md:-mr-6"
                    style={{
                        background: "var(--background-card)",
                        border: "1px solid var(--border)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    }}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Carousel Container */}
                <div
                    ref={carouselRef}
                    className="flex gap-4 overflow-x-auto pb-4 px-2 scroll-smooth scrollbar-hide"
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}
                >
                    {playlist.videos.map((video, index) => (
                        <a
                            key={video.id}
                            href={`https://www.youtube.com/watch?v=${video.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 w-72 md:w-80 group"
                        >
                            <div className="video-card overflow-hidden">
                                <div className="relative aspect-video">
                                    {video.thumbnailUrl ? (
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                            <span className="text-4xl">🎬</span>
                                        </div>
                                    )}

                                    {/* Play overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <div
                                            className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                                            style={{ background: "rgba(255,255,255,0.9)" }}
                                        >
                                            <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Duration badge */}
                                    <span
                                        className="absolute bottom-2 right-2 px-2 py-1 text-xs font-semibold rounded"
                                        style={{ background: "rgba(0,0,0,0.85)" }}
                                    >
                                        {formatDuration(video.duration)}
                                    </span>

                                    {/* Index badge */}
                                    <span
                                        className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full"
                                        style={{ background: "linear-gradient(135deg, var(--primary-start), var(--primary-end))" }}
                                    >
                                        {index + 1}
                                    </span>
                                </div>

                                <div className="p-4">
                                    <h4 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-[var(--primary-start)] transition-colors">
                                        {video.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--foreground-muted)" }}>
                                        <span>{formatViewCount(video.viewCount)} views</span>
                                        <span>•</span>
                                        <span>{new Date(video.publishedAt).getFullYear()}</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* Action Buttons - Bottom Bar */}
            <div className="glass-card p-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    {/* Primary CTA - Watch on YouTube */}
                    <a
                        href={playlist.watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        style={{
                            background: "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)",
                            boxShadow: "0 8px 32px rgba(255, 0, 0, 0.3)",
                        }}
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                        </svg>
                        Watch on YouTube
                    </a>

                    {/* Secondary Actions */}
                    <div className="flex gap-3">
                        {/* Share / Copy Link */}
                        <button
                            onClick={copyLink}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all hover:scale-105"
                            style={{
                                background: "var(--background-card)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            {copied ? (
                                <>
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-green-400">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    <span>Share</span>
                                </>
                            )}
                        </button>

                        {/* Save to History */}
                        <button
                            onClick={saveToHistory}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all hover:scale-105"
                            style={{
                                background: "var(--background-card)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            {saved ? (
                                <>
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-green-400">Saved!</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                    <span className="hidden sm:inline">Save</span>
                                </>
                            )}
                        </button>

                        {/* Generate Another */}
                        <button
                            onClick={onReset}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all hover:scale-105"
                            style={{
                                background: "var(--background-card)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="hidden sm:inline">New</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sticky Mobile CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent md:hidden z-50">
                <a
                    href={playlist.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold text-lg"
                    style={{
                        background: "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)",
                        boxShadow: "0 8px 32px rgba(255, 0, 0, 0.4)",
                    }}
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                    Watch on YouTube
                </a>
            </div>

            {/* Bottom padding for mobile sticky CTA */}
            <div className="h-24 md:hidden" />
        </div>
    );
}
