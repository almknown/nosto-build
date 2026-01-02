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
        setQuery(result.title); // Or maybe show the ID/handle?
        handleLookup(result.id); // Use ID for precise lookup
    };

    return (
        <div className="w-full max-w-xl relative" ref={wrapperRef}>
            <div className="flex gap-3">
                <input
                    type="text"
                    className="input flex-1"
                    placeholder="Enter YouTube handle (e.g., @MrBeast) or name"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={submitting}
                    onFocus={() => {
                        if (results.length > 0) setShowResults(true);
                    }}
                />
                <button
                    className="btn-primary whitespace-nowrap"
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
                            Searching...
                        </span>
                    ) : (
                        "Find Channel"
                    )}
                </button>
            </div>

            {/* Live Search Results Dropdown */}
            {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-card overflow-hidden z-50 shadow-xl border border-[var(--border)]">
                    <ul>
                        {results.map((result) => (
                            <li key={result.id}>
                                <button
                                    className="w-full text-left px-4 py-3 hover:bg-[var(--background-hover)] flex items-center gap-3 transition-colors"
                                    onClick={() => selectResult(result)}
                                >
                                    {result.thumbnailUrl && (
                                        <img
                                            src={result.thumbnailUrl}
                                            alt={result.title}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    )}
                                    <div>
                                        <div className="font-semibold text-sm">{result.title}</div>
                                        {/* <div className="text-xs text-[var(--foreground-muted)] line-clamp-1">{result.description}</div> */}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {error && (
                <p className="mt-3 text-sm" style={{ color: "var(--error)" }}>
                    {error}
                </p>
            )}
        </div>
    );
}
