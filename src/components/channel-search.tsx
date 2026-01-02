"use client";

import { useState, useCallback } from "react";
import type { ChannelResponse } from "@/types";

interface ChannelSearchProps {
    onSelect: (channel: ChannelResponse) => void;
}

export default function ChannelSearch({ onSelect }: ChannelSearchProps) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/channels/lookup?q=${encodeURIComponent(query.trim())}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Channel not found");
            }

            onSelect(data as ChannelResponse);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to find channel");
        } finally {
            setLoading(false);
        }
    }, [query, onSelect]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !loading) {
            handleSearch();
        }
    };

    return (
        <div className="w-full max-w-xl">
            <div className="flex gap-3">
                <input
                    type="text"
                    className="input flex-1"
                    placeholder="Enter YouTube handle (e.g., @MrBeast)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                />
                <button
                    className="btn-primary whitespace-nowrap"
                    onClick={handleSearch}
                    disabled={loading || !query.trim()}
                >
                    {loading ? (
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

            {error && (
                <p className="mt-3 text-sm" style={{ color: "var(--error)" }}>
                    {error}
                </p>
            )}
        </div>
    );
}
