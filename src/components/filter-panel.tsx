"use client";

import { useState, useEffect } from "react";
import type { PlaylistFilters } from "@/types";

interface FilterPanelProps {
    onFiltersChange: (filters: PlaylistFilters, count: number) => void;
    onGenerate: () => void;
    loading: boolean;
    disabled: boolean;
}

const currentYear = new Date().getFullYear();

export default function FilterPanel({
    onFiltersChange,
    onGenerate,
    loading,
    disabled,
}: FilterPanelProps) {
    const [yearStart, setYearStart] = useState<number | undefined>();
    const [yearEnd, setYearEnd] = useState<number | undefined>();
    const [topicPrompt, setTopicPrompt] = useState("");
    const [deepCuts, setDeepCuts] = useState(false);
    const [excludeShorts, setExcludeShorts] = useState(true);
    const [count, setCount] = useState(10);
    const [minDuration, setMinDuration] = useState<number>(0); // minutes
    const [maxDuration, setMaxDuration] = useState<number>(0); // 0 = no limit

    // Sync filters with parent
    useEffect(() => {
        const filters: PlaylistFilters = {};

        if (yearStart) filters.yearStart = yearStart;
        if (yearEnd) filters.yearEnd = yearEnd;
        if (topicPrompt.trim()) {
            filters.topicPrompt = topicPrompt.trim();
        }
        if (deepCuts) filters.deepCuts = true;
        if (excludeShorts) filters.excludeShorts = true;
        // Duration filters (convert minutes to seconds)
        if (minDuration > 0) filters.minDuration = minDuration * 60;
        if (maxDuration > 0) filters.maxDuration = maxDuration * 60;

        onFiltersChange(filters, count);
    }, [yearStart, yearEnd, topicPrompt, deepCuts, excludeShorts, count, minDuration, maxDuration, onFiltersChange]);

    const years = Array.from({ length: currentYear - 2005 + 1 }, (_, i) => 2005 + i).reverse();

    return (
        <div className="glass-card p-6 w-full max-w-xl">
            <h3 className="text-lg font-semibold mb-4 gradient-text">Customize Your Playlist</h3>

            <div className="space-y-5">
                {/* AI Topic Prompt - Featured */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        🤖 What videos are you looking for?
                    </label>
                    <textarea
                        className="input min-h-[80px] resize-none"
                        placeholder='Describe what you want, e.g., "Teemo gameplay videos" or "funny moments from 2020" or "guide videos for beginners"'
                        value={topicPrompt}
                        onChange={(e) => setTopicPrompt(e.target.value)}
                        maxLength={500}
                    />
                    <p className="text-xs mt-1" style={{ color: "var(--foreground-muted)" }}>
                        AI will analyze video titles and descriptions to find the best matches
                    </p>
                </div>

                {/* Playlist Count */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Number of Videos: <span className="gradient-text font-bold">{count}</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value))}
                        className="w-full accent-current"
                        style={{ accentColor: "var(--primary-start)" }}
                    />
                    <div className="flex justify-between text-xs" style={{ color: "var(--foreground-muted)" }}>
                        <span>1</span>
                        <span>20</span>
                    </div>
                </div>

                {/* Year Range */}
                <div>
                    <label className="block text-sm font-medium mb-2">Era / Year Range (optional)</label>
                    <div className="flex gap-3 items-center">
                        <select
                            className="input flex-1"
                            value={yearStart ?? ""}
                            onChange={(e) => {
                                const val = e.target.value ? parseInt(e.target.value) : undefined;
                                setYearStart(val);
                            }}
                        >
                            <option value="">From...</option>
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <span style={{ color: "var(--foreground-muted)" }}>to</span>
                        <select
                            className="input flex-1"
                            value={yearEnd ?? ""}
                            onChange={(e) => {
                                const val = e.target.value ? parseInt(e.target.value) : undefined;
                                setYearEnd(val);
                            }}
                        >
                            <option value="">To...</option>
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Duration Range */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        ⏱️ Video Duration (minutes)
                    </label>
                    <div className="flex gap-3 items-center">
                        <div className="flex-1">
                            <label className="text-xs mb-1 block" style={{ color: "var(--foreground-muted)" }}>Min</label>
                            <select
                                className="input w-full"
                                value={minDuration}
                                onChange={(e) => setMinDuration(parseInt(e.target.value))}
                            >
                                <option value="0">No min</option>
                                <option value="1">1 min</option>
                                <option value="2">2 min</option>
                                <option value="3">3 min</option>
                                <option value="5">5 min</option>
                                <option value="8">8 min</option>
                                <option value="10">10 min</option>
                                <option value="15">15 min</option>
                                <option value="20">20 min</option>
                                <option value="30">30 min</option>
                            </select>
                        </div>
                        <span style={{ color: "var(--foreground-muted)", marginTop: "18px" }}>to</span>
                        <div className="flex-1">
                            <label className="text-xs mb-1 block" style={{ color: "var(--foreground-muted)" }}>Max</label>
                            <select
                                className="input w-full"
                                value={maxDuration}
                                onChange={(e) => setMaxDuration(parseInt(e.target.value))}
                            >
                                <option value="0">No max</option>
                                <option value="3">3 min</option>
                                <option value="5">5 min</option>
                                <option value="8">8 min</option>
                                <option value="10">10 min</option>
                                <option value="15">15 min</option>
                                <option value="20">20 min</option>
                                <option value="30">30 min</option>
                                <option value="45">45 min</option>
                                <option value="60">60 min</option>
                            </select>
                        </div>
                    </div>
                    {minDuration > 0 || maxDuration > 0 ? (
                        <p className="text-xs mt-1 font-medium" style={{ color: "var(--primary-start)" }}>
                            📏 Filtering: {minDuration > 0 ? `${minDuration}+ min` : "any"}
                            {maxDuration > 0 ? ` up to ${maxDuration} min` : ""}
                        </p>
                    ) : null}
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={deepCuts}
                            onChange={(e) => setDeepCuts(e.target.checked)}
                            className="w-5 h-5 rounded"
                        />
                        <span className="text-sm">Deep Cuts Only</span>
                        <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: "var(--background-hover)", color: "var(--foreground-muted)" }}
                        >
                            Bottom 25% views
                        </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={excludeShorts}
                            onChange={(e) => setExcludeShorts(e.target.checked)}
                            className="w-5 h-5 rounded"
                        />
                        <span className="text-sm">Exclude Shorts</span>
                    </label>
                </div>

                {/* Generate Button */}
                <button
                    className="btn-primary w-full mt-4"
                    onClick={onGenerate}
                    disabled={loading || disabled}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            {topicPrompt ? "AI Analyzing..." : "Generating..."}
                        </span>
                    ) : (
                        `✨ Generate ${count} Video${count > 1 ? "s" : ""}`
                    )}
                </button>
            </div>
        </div>
    );
}
