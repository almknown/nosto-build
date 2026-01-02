"use client";

import { useState, useEffect, useRef } from "react";
import type { ChannelResponse } from "@/types";

interface ChannelSearchProps {
    onSelect: (channel: ChannelResponse) => void;
}

interface SearchResult {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
}

export default function ChannelSearch({ onSelect }: ChannelSearchProps) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);

    // Debounce timer
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Perform live search
    const performLiveSearch = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setResults([]);
            return;
        }

        try {
            const res = await fetch(`/api/channels/search?q=${encodeURIComponent(searchTerm)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data.results || []);
                setShowResults(true);
            }
        } catch (e) {
            console.error("Live search failed", e);
        }
    };

    // Handle input change with debounce
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setError(null);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (val.trim().length >= 3) {
            debounceRef.current = setTimeout(() => {
                performLiveSearch(val);
            }, 600); // 600ms debounce to save quota
        } else {
            setResults([]);
            setShowResults(false);
        }
    };

    // Full channel lookup (when selecting or hitting enter)
    const handleLookup = async (lookupQuery: string) => {
        if (!lookupQuery.trim()) return;

        setSubmitting(true);
        setError(null);
        setShowResults(false);

        try {
            const res = await fetch(`/api/channels/lookup?q=${encodeURIComponent(lookupQuery.trim())}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Channel not found");
            }

            onSelect(data as ChannelResponse);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to find channel");
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !submitting) {
            e.preventDefault(); // Prevent form submission if any

            // If we have live results, select the first one
            if (results.length > 0) {
                selectResult(results[0]);
            } else {
                // Otherwise fall back to trying a direct lookup
                handleLookup(query);
            }
        }
    };

    const selectResult = (result: SearchResult) => {
        // Sync input value with what we're actually looking up
        // Show the ID (handle) so user clearly sees what channel is selected
        const displayValue = result.id.startsWith('UC')
            ? result.title  // If it's a raw channel ID, show title
            : result.id;    // If it's a handle like @MrBeast, show that
        setQuery(displayValue);
        setShowResults(false); // Hide dropdown immediately after selection
        handleLookup(result.id); // Use ID for precise lookup
    };

    return (
        <div className="w-full max-w-2xl relative" ref={wrapperRef}>
            {/* Search Card */}
            <div className="glass-card p-6 relative overflow-hidden">
                {/* Subtle gradient accent */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        background: "radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.2), transparent 60%)",
                    }}
                />

                <div className="relative">
                    <label className="block text-base font-semibold mb-4 flex items-center gap-2">
                        <span className="text-xl">🔍</span>
                        Find a YouTube Channel
                    </label>

                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-5 h-5" style={{ color: "var(--foreground-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="input pl-12 py-4 text-base rounded-xl"
                                placeholder="@MrBeast or channel name"
                                value={query}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                disabled={submitting}
                                onFocus={() => {
                                    if (results.length > 0) setShowResults(true);
                                }}
                            />
                        </div>
                        <button
                            className="px-6 py-4 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            style={{
                                background: "linear-gradient(135deg, var(--primary-start), var(--primary-end))",
                                boxShadow: submitting ? "none" : "0 4px 16px rgba(99, 102, 241, 0.4)",
                            }}
                            onClick={() => handleLookup(query)}
                            disabled={submitting || !query.trim()}
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
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
                                    <span className="hidden sm:inline">Searching...</span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <span className="hidden sm:inline">Find Channel</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    </div>

                    <p className="text-xs mt-3" style={{ color: "var(--foreground-muted)" }}>
                        Tip: Use the @ handle for best results (e.g., @MrBeast, @Pianta)
                    </p>
                </div>
            </div>

            {/* Live Search Results Dropdown */}
            {showResults && results.length > 0 && (
                <div
                    className="absolute top-full left-0 right-0 mt-2 glass-card overflow-hidden z-50 shadow-2xl border"
                    style={{ borderColor: "var(--border)" }}
                >
                    <ul>
                        {results.map((result, index) => (
                            <li key={result.id}>
                                <button
                                    className={`w-full text-left px-5 py-4 flex items-center gap-4 transition-all ${index === 0 ? "bg-[var(--background-hover)]" : "hover:bg-[var(--background-hover)]"
                                        }`}
                                    onClick={() => selectResult(result)}
                                >
                                    {result.thumbnailUrl && (
                                        <img
                                            src={result.thumbnailUrl}
                                            alt={result.title}
                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-[var(--border)]"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-base truncate">{result.title}</div>
                                        <div className="text-sm truncate" style={{ color: "var(--foreground-muted)" }}>
                                            {result.id.startsWith('@') ? result.id : `ID: ${result.id.slice(0, 12)}...`}
                                        </div>
                                    </div>
                                    {index === 0 && (
                                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--primary-start)", color: "white" }}>
                                            Enter ↵
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {error && (
                <div
                    className="mt-4 p-4 rounded-xl text-center border"
                    style={{ background: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.2)", color: "var(--error)" }}
                >
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}
        </div>
    );
}
