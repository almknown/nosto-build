"use client";

import { useState, useCallback } from "react";
import ChannelSearch from "@/components/channel-search";
import IndexingProgress from "@/components/indexing-progress";
import FilterPanel from "@/components/filter-panel";
import PlaylistResult from "@/components/playlist-result";
import type { ChannelResponse, PlaylistFilters, GeneratedPlaylistResponse } from "@/types";

type Step = "search" | "indexing" | "filter" | "result";

const STEPS = [
    { id: "search", label: "Channel", icon: "🔍" },
    { id: "indexing", label: "Loading", icon: "⏳" },
    { id: "filter", label: "Filters", icon: "⚙️" },
] as const;

export default function GeneratePage() {
    const [step, setStep] = useState<Step>("search");
    const [channel, setChannel] = useState<ChannelResponse | null>(null);
    const [filters, setFilters] = useState<PlaylistFilters>({});
    const [count, setCount] = useState(10);
    const [playlist, setPlaylist] = useState<GeneratedPlaylistResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFiltersChange = useCallback((newFilters: PlaylistFilters, newCount: number) => {
        setFilters(newFilters);
        setCount(newCount);
    }, []);

    const handleChannelSelect = useCallback((selectedChannel: ChannelResponse) => {
        setChannel(selectedChannel);
        setError(null);

        if (selectedChannel.indexStatus === "COMPLETE") {
            setStep("filter");
        } else {
            setStep("indexing");
        }
    }, []);

    const handleIndexComplete = useCallback((updatedChannel: ChannelResponse) => {
        setChannel(updatedChannel);
        setStep("filter");
    }, []);

    const handleGenerate = async () => {
        if (!channel) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/playlists/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    channelId: channel.channelId,
                    filters,
                    count,
                    shuffle: true,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate playlist");
            }

            setPlaylist(data);
            setStep("result");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate playlist");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStep("search");
        setChannel(null);
        setFilters({});
        setPlaylist(null);
        setError(null);
    };

    const getStepIndex = (s: Step): number => {
        const idx = STEPS.findIndex(step => step.id === s);
        return idx === -1 ? STEPS.length : idx;
    };

    const currentStepIndex = getStepIndex(step);

    return (
        <main className="min-h-screen py-12 px-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-3xl animate-fadeIn">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text-logo">NosBot</span>{" "}
                        <span style={{ color: "var(--foreground)" }}>Generator</span>
                    </h1>
                    <p className="text-lg" style={{ color: "var(--foreground-muted)" }}>
                        Configure your filters and let AI curate the perfect playlist
                    </p>
                </div>

                {/* Main Interaction Card */}
                <div className="glass-card p-6 md:p-10 w-full relative overflow-visible">
                    {/* Step indicator - Redesigned pill style with labels */}
                    {step !== "result" && (
                        <div className="flex justify-center mb-8">
                            <div className="inline-flex items-center gap-0 p-1 rounded-full" style={{ background: "var(--background)" }}>
                                {STEPS.map((s, i) => {
                                    const isActive = step === s.id;
                                    const isCompleted = currentStepIndex > i;
                                    const isClickable = i < currentStepIndex;

                                    return (
                                        <button
                                            key={s.id}
                                            className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                                                    ? "text-white shadow-lg"
                                                    : isCompleted
                                                        ? "text-white/80 hover:text-white"
                                                        : ""
                                                }`}
                                            style={{
                                                background: isActive
                                                    ? "linear-gradient(135deg, var(--primary-start), var(--primary-end))"
                                                    : isCompleted
                                                        ? "rgba(99, 102, 241, 0.3)"
                                                        : "transparent",
                                                color: isActive || isCompleted ? undefined : "var(--foreground-muted)",
                                                cursor: isClickable ? "pointer" : "default",
                                            }}
                                            onClick={() => {
                                                if (isClickable) {
                                                    if (s.id === "search") {
                                                        handleReset();
                                                    } else if (s.id === "filter" && channel?.indexStatus === "COMPLETE") {
                                                        setStep("filter");
                                                    }
                                                }
                                            }}
                                            disabled={!isClickable && !isActive}
                                        >
                                            <span className="hidden sm:inline">{s.icon}</span>
                                            <span>{s.label}</span>
                                            {isCompleted && !isActive && (
                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Steps Content */}
                    <div className="flex flex-col items-center w-full">
                        {step === "search" && <ChannelSearch onSelect={handleChannelSelect} />}

                        {step === "indexing" && channel && (
                            <IndexingProgress
                                channel={channel}
                                onComplete={handleIndexComplete}
                                onCancel={handleReset}
                            />
                        )}

                        {step === "filter" && channel && (
                            <div className="w-full">
                                {/* Channel Info - Enhanced */}
                                <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-gradient-to-r from-[var(--background)] to-[var(--background-card)] border border-[var(--border)]">
                                    {channel.thumbnailUrl && (
                                        <img
                                            src={channel.thumbnailUrl}
                                            alt={channel.title}
                                            className="w-14 h-14 rounded-full ring-2 ring-offset-2 ring-offset-[var(--background-card)]"
                                            style={{ boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)" }}
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            {channel.title}
                                            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </h3>
                                        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                                            {channel.indexedVideoCount.toLocaleString()} videos ready
                                        </p>
                                    </div>
                                    <button
                                        className="text-sm px-4 py-2 rounded-lg border transition-all hover:bg-[var(--background-hover)] hover:border-[var(--primary-start)]"
                                        style={{ color: "var(--foreground-muted)", borderColor: "var(--border)" }}
                                        onClick={handleReset}
                                    >
                                        Change
                                    </button>
                                </div>

                                <FilterPanel
                                    onFiltersChange={handleFiltersChange}
                                    onGenerate={handleGenerate}
                                    loading={loading}
                                    disabled={false}
                                />

                                {error && (
                                    <div
                                        className="mt-6 p-4 rounded-lg text-center border border-red-500/20"
                                        style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--error)" }}
                                    >
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}

                        {step === "result" && playlist && (
                            <div className="w-full flex flex-col items-center">
                                {playlist.videos.length < count && (
                                    <div className="w-full max-w-4xl mb-6 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-200 text-sm text-center">
                                        Found {playlist.videos.length} videos matching your specific criteria (requested {count}).
                                        We excluded unrelated content to keep the playlist high quality.
                                    </div>
                                )}
                                <PlaylistResult playlist={playlist} onReset={handleReset} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
