"use client";

import { useState, useCallback } from "react";
import ChannelSearch from "@/components/channel-search";
import IndexingProgress from "@/components/indexing-progress";
import FilterPanel from "@/components/filter-panel";
import PlaylistResult from "@/components/playlist-result";
import type { ChannelResponse, PlaylistFilters, GeneratedPlaylistResponse } from "@/types";

type Step = "search" | "indexing" | "filter" | "result";

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

    return (
        <main className="min-h-screen py-12 px-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-3xl animate-fadeIn">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">NosBot</span> Generator
                    </h1>
                    <p className="text-lg" style={{ color: "var(--foreground-muted)" }}>
                        Configure your filters and let AI curate the perfect playlist
                    </p>
                </div>

                {/* Main Interaction Card */}
                <div className="glass-card p-6 md:p-10 w-full relative overflow-visible">
                    {/* Progress indicator */}
                    {step !== "result" && (
                        <div className="flex justify-center mb-8">
                            <div className="flex items-center gap-2">
                                {["search", "indexing", "filter"].map((s, i) => (
                                    <div key={s} className="flex items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${step === s
                                                ? "animate-pulse-glow"
                                                : i < ["search", "indexing", "filter"].indexOf(step)
                                                    ? ""
                                                    : ""
                                                }`}
                                            style={{
                                                background:
                                                    step === s || i < ["search", "indexing", "filter"].indexOf(step)
                                                        ? "linear-gradient(135deg, var(--primary-start), var(--primary-end))"
                                                        : "var(--background-card)",
                                                border: "1px solid var(--border)",
                                            }}
                                        >
                                            {i + 1}
                                        </div>
                                        {i < 2 && (
                                            <div
                                                className="w-12 h-0.5 mx-2"
                                                style={{
                                                    background:
                                                        i < ["search", "indexing", "filter"].indexOf(step)
                                                            ? "var(--primary-start)"
                                                            : "var(--border)",
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
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
                                {/* Channel Info - Inline */}
                                <div className="flex items-center gap-4 mb-8 p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                                    {channel.thumbnailUrl && (
                                        <img
                                            src={channel.thumbnailUrl}
                                            alt={channel.title}
                                            className="w-12 h-12 rounded-full ring-2 ring-[var(--primary-start)]"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{channel.title}</h3>
                                        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                                            {channel.indexedVideoCount.toLocaleString()} videos found
                                        </p>
                                    </div>
                                    <button
                                        className="text-sm px-3 py-1.5 rounded hover:text-white transition-colors"
                                        style={{ color: "var(--foreground-muted)" }}
                                        onClick={handleReset}
                                    >
                                        Change Channel
                                    </button>
                                </div>

                                <FilterPanel
                                    onFiltersChange={handleFiltersChange}
                                    onGenerate={handleGenerate}
                                    loading={loading}
                                    disabled={false}
                                // Pass full width to children
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
