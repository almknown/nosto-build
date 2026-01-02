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

        onFiltersChange(filters, count);
    }, [yearStart, yearEnd, topicPrompt, deepCuts, excludeShorts, count, onFiltersChange]);

    const years = Array.from({ length: currentYear - 2005 + 1 }, (_, i) => 2005 + i).reverse();

    return (
        <div className="glass-card p-6 w-full max-w-xl">
            <h3 className="text-lg font-semibold mb-4 gradient-text">Customize Your Playlist</h3>

            <div className="space-y-5">
                {/* AI Topic Prompt - Featured & Enlarged */}
                <div>
                    <label className="block text-lg font-semibold mb-3 flex items-center gap-2">
                        <span className="text-2xl">🤖</span>
                        <span className="gradient-text">What videos are you looking for?</span>
                        <span
                            className="text-xs px-2 py-1 rounded-full font-normal"
                            style={{ background: "var(--background-hover)", color: "var(--foreground-muted)" }}
                        >
                            AI-Powered
                        </span>
                    </label>
                    <textarea
                        className="input min-h-[100px] resize-none text-base"
                        placeholder='Examples:
• "Teemo gameplay videos from 2019-2020"
• "Funny moments and fails"  
• "In-depth guide videos for beginners"
• "High elo ranked games"
• "Champion spotlights and montages"

AI will analyze titles & descriptions to find your perfect playlist!'
                        value={topicPrompt}
                        onChange={(e) => setTopicPrompt(e.target.value)}
                        maxLength={500}
                        style={{
                            transition: "all 0.3s ease",
                            ...(topicPrompt && {
                                borderColor: "var(--primary-start)",
                                boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                            }),
                        }}
                    />
                    <p className="text-xs mt-2 flex items-start gap-2" style={{ color: "var(--foreground-muted)" }}>
                        <span>💡</span>
                        <span>
                            Tip: Be specific! The AI works best with clear descriptions like time periods,
                            gameplay types, or video themes.
                        </span>
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
