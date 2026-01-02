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
    const [minDuration, setMinDuration] = useState<number>(0);
    const [maxDuration, setMaxDuration] = useState<number>(0);
    const [showAdvanced, setShowAdvanced] = useState(false);

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
        if (minDuration > 0) filters.minDuration = minDuration * 60;
        if (maxDuration > 0) filters.maxDuration = maxDuration * 60;

        onFiltersChange(filters, count);
    }, [yearStart, yearEnd, topicPrompt, deepCuts, excludeShorts, count, minDuration, maxDuration, onFiltersChange]);

    const yearsDesc = Array.from({ length: currentYear - 2005 + 1 }, (_, i) => 2005 + i).reverse();
    const yearsAsc = [...yearsDesc].reverse();

    const hasAdvancedFilters = yearStart || yearEnd || deepCuts || minDuration > 0 || maxDuration > 0;

    return (
        <div className="w-full">
            {/* Quick Mode Card */}
            <div className="glass-card p-5 mb-6 border-2 border-dashed" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="font-semibold text-base flex items-center gap-2">
                            <span className="text-xl">⚡</span> Quick Mode
                        </p>
                        <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                            Skip customization — get 10 random classics
                        </p>
                    </div>
                    <button
                        className="btn-secondary text-sm whitespace-nowrap px-5 py-2.5 rounded-xl"
                        onClick={onGenerate}
                        disabled={loading || disabled}
                    >
                        {loading ? "Generating..." : "🎲 Surprise Me!"}
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="relative my-8">
                <div className="absolute inset-x-0 top-1/2 border-t" style={{ borderColor: "var(--border)" }} />
                <div className="relative flex justify-center">
                    <span className="px-4 text-sm font-medium" style={{ background: "var(--background-card)", color: "var(--foreground-muted)" }}>
                        or customize your playlist
                    </span>
                </div>
            </div>

            {/* AI Topic Prompt - Featured Card */}
            <div className="glass-card p-6 mb-6 relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: "radial-gradient(ellipse at top right, rgba(139, 92, 246, 0.15), transparent 60%)",
                    }}
                />
                <div className="relative">
                    <label className="block text-base font-semibold mb-3 flex items-center gap-2">
                        <span className="text-xl">🤖</span>
                        What videos are you looking for?
                    </label>
                    <textarea
                        className="input min-h-[100px] resize-none text-base"
                        placeholder='Try: "funny moments from 2018" or "tutorial videos" or "gaming highlights"'
                        value={topicPrompt}
                        onChange={(e) => setTopicPrompt(e.target.value)}
                        maxLength={500}
                    />
                    <p className="text-xs mt-2" style={{ color: "var(--foreground-muted)" }}>
                        Leave empty for random classics from this channel
                    </p>
                </div>
            </div>

            {/* Playlist Count with Visual Slider */}
            <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">
                    Number of Videos
                </label>

                {/* Desktop: Visual Slider */}
                <div className="hidden md:block">
                    <div className="relative pt-1">
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={count}
                                onChange={(e) => setCount(parseInt(e.target.value))}
                                className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, var(--primary-start) 0%, var(--primary-end) ${(count / 20) * 100}%, var(--background-hover) ${(count / 20) * 100}%, var(--background-hover) 100%)`,
                                }}
                            />
                            <div
                                className="w-14 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
                                style={{
                                    background: "linear-gradient(135deg, var(--primary-start), var(--primary-end))",
                                }}
                            >
                                {count}
                            </div>
                        </div>
                        <div className="flex justify-between text-xs mt-2 px-1" style={{ color: "var(--foreground-muted)" }}>
                            <span>1</span>
                            <span>5</span>
                            <span>10</span>
                            <span>15</span>
                            <span>20</span>
                        </div>
                    </div>
                </div>

                {/* Mobile: Preset buttons */}
                <div className="flex gap-2 md:hidden">
                    {[5, 10, 15, 20].map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => setCount(preset)}
                            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${count === preset
                                    ? "text-white shadow-lg"
                                    : "hover:bg-[var(--border)]"
                                }`}
                            style={{
                                background: count === preset
                                    ? "linear-gradient(135deg, var(--primary-start), var(--primary-end))"
                                    : "var(--background-hover)",
                            }}
                        >
                            {preset}
                        </button>
                    ))}
                </div>
            </div>

            {/* Advanced Options Accordion */}
            <div className="glass-card overflow-hidden mb-6">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full px-5 py-4 flex items-center justify-between text-sm font-semibold hover:bg-[var(--background-hover)] transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <span className="text-lg">⚙️</span>
                        Advanced Options
                        {hasAdvancedFilters && (
                            <span
                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: "linear-gradient(135deg, var(--primary-start), var(--primary-end))", color: "white" }}
                            >
                                Active
                            </span>
                        )}
                    </span>
                    <svg
                        className={`w-5 h-5 transition-transform duration-300 ${showAdvanced ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showAdvanced && (
                    <div className="p-5 border-t space-y-5" style={{ borderColor: "var(--border)" }}>
                        {/* Two-column grid for desktop */}
                        <div className="grid md:grid-cols-2 gap-5">
                            {/* Year Range */}
                            <div>
                                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                    <span>📅</span> Year Range
                                </label>
                                <div className="flex gap-2 items-center">
                                    <select
                                        className="input flex-1"
                                        value={yearStart ?? ""}
                                        onChange={(e) => {
                                            const val = e.target.value ? parseInt(e.target.value) : undefined;
                                            setYearStart(val);
                                        }}
                                    >
                                        <option value="">From...</option>
                                        {yearsAsc.map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                    <span style={{ color: "var(--foreground-muted)" }}>→</span>
                                    <select
                                        className="input flex-1"
                                        value={yearEnd ?? ""}
                                        onChange={(e) => {
                                            const val = e.target.value ? parseInt(e.target.value) : undefined;
                                            setYearEnd(val);
                                        }}
                                    >
                                        <option value="">To...</option>
                                        {yearsDesc.map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Duration Range */}
                            <div>
                                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                    <span>⏱️</span> Video Duration
                                </label>
                                <div className="flex gap-2 items-center">
                                    <select
                                        className="input flex-1"
                                        value={minDuration}
                                        onChange={(e) => setMinDuration(parseFloat(e.target.value))}
                                    >
                                        <option value="0">Min...</option>
                                        <option value="1">1 min</option>
                                        <option value="2">2 min</option>
                                        <option value="3">3 min</option>
                                        <option value="5">5 min</option>
                                        <option value="10">10 min</option>
                                        <option value="15">15 min</option>
                                    </select>
                                    <span style={{ color: "var(--foreground-muted)" }}>→</span>
                                    <select
                                        className="input flex-1"
                                        value={maxDuration}
                                        onChange={(e) => setMaxDuration(parseFloat(e.target.value))}
                                    >
                                        <option value="0">Max...</option>
                                        <option value="5">5 min</option>
                                        <option value="10">10 min</option>
                                        <option value="15">15 min</option>
                                        <option value="20">20 min</option>
                                        <option value="30">30 min</option>
                                        <option value="60">60 min</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Toggles Row */}
                        <div className="flex flex-wrap gap-4 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-[var(--background-hover)] transition-colors">
                                <input
                                    type="checkbox"
                                    checked={deepCuts}
                                    onChange={(e) => setDeepCuts(e.target.checked)}
                                    className="w-5 h-5 rounded accent-purple-500"
                                />
                                <div>
                                    <span className="text-sm font-medium">Deep Cuts Only</span>
                                    <span
                                        className="ml-2 text-xs px-2 py-0.5 rounded-full"
                                        style={{ background: "var(--background-hover)", color: "var(--foreground-muted)" }}
                                    >
                                        Hidden gems
                                    </span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-[var(--background-hover)] transition-colors">
                                <input
                                    type="checkbox"
                                    checked={excludeShorts}
                                    onChange={(e) => setExcludeShorts(e.target.checked)}
                                    className="w-5 h-5 rounded accent-purple-500"
                                />
                                <span className="text-sm font-medium">Exclude Shorts</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Generate Button - Full Width Gradient */}
            <button
                className="w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                    background: "linear-gradient(135deg, var(--primary-start), var(--primary-end))",
                    boxShadow: "0 8px 32px rgba(99, 102, 241, 0.4)",
                }}
                onClick={onGenerate}
                disabled={loading || disabled}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-3">
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
                        {topicPrompt ? "AI is finding your videos..." : "Generating..."}
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        ✨ Generate {count} Video{count > 1 ? "s" : ""}
                    </span>
                )}
            </button>
        </div>
    );
}
