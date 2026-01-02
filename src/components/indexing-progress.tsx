"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ChannelResponse } from "@/types";

interface IndexingProgressProps {
    channel: ChannelResponse;
    onComplete: (channel: ChannelResponse) => void;
    onCancel?: () => void;
}

const MAX_RETRIES = 3;
const STALE_TIMEOUT_MS = 60000; // 60 seconds without progress = stale
const POLL_INTERVAL_MS = 2000;

export default function IndexingProgress({ channel, onComplete, onCancel }: IndexingProgressProps) {
    const [status, setStatus] = useState(channel.indexStatus);
    const [indexedCount, setIndexedCount] = useState(channel.indexedVideoCount);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isStale, setIsStale] = useState(false);

    // Track last progress for stale detection
    const lastProgressRef = useRef<{ count: number; time: number }>({
        count: channel.indexedVideoCount,
        time: Date.now(),
    });

    const totalCount = channel.totalVideoCount || 1;
    const progress = Math.min((indexedCount / totalCount) * 100, 100);

    const startIndexing = useCallback(async () => {
        setError(null);
        setIsStale(false);

        try {
            const res = await fetch(`/api/channels/${channel.channelId}/index`, { method: "POST" });
            const data = await res.json();

            console.log("Index trigger response:", data);

            if (data.error) {
                setError(data.error);
                return false;
            }

            // API returns 'started', 'already_complete', or 'in_progress'
            if (data.status === "started" || data.status === "in_progress") {
                setStatus("IN_PROGRESS");
                return true;
            } else if (data.status === "already_complete") {
                setStatus("COMPLETE");
                setIndexedCount(data.indexedVideoCount || indexedCount);
                return true;
            }

            return true;
        } catch (e) {
            console.error("Index trigger error:", e);
            setError(e instanceof Error ? e.message : "Failed to start indexing");
            return false;
        }
    }, [channel.channelId, indexedCount]);

    const handleRetry = useCallback(async () => {
        if (retryCount >= MAX_RETRIES) {
            setError(`Maximum retries (${MAX_RETRIES}) exceeded. Please try again later.`);
            return;
        }

        setRetryCount((prev) => prev + 1);
        setStatus("PENDING");
        lastProgressRef.current = { count: 0, time: Date.now() };
        await startIndexing();
    }, [retryCount, startIndexing]);

    useEffect(() => {
        if (status === "COMPLETE") {
            onComplete({ ...channel, indexStatus: "COMPLETE", indexedVideoCount: indexedCount });
            return;
        }

        if (status === "PENDING") {
            startIndexing();
        }

        // Poll for progress
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/channels/${channel.channelId}/index`);
                const data = await res.json();

                if (data.error) {
                    console.error("Polling error:", data.error);
                    return;
                }

                setStatus(data.indexStatus);
                setIndexedCount(data.indexedVideoCount);

                // Check for stale progress
                const now = Date.now();
                if (data.indexedVideoCount > lastProgressRef.current.count) {
                    // Progress was made, update tracking
                    lastProgressRef.current = { count: data.indexedVideoCount, time: now };
                    setIsStale(false);
                } else if (
                    data.indexStatus === "IN_PROGRESS" &&
                    now - lastProgressRef.current.time > STALE_TIMEOUT_MS
                ) {
                    // No progress for too long
                    setIsStale(true);
                }

                if (data.indexStatus === "COMPLETE") {
                    clearInterval(interval);
                    onComplete({ ...channel, ...data });
                }

                if (data.indexStatus === "FAILED") {
                    clearInterval(interval);
                    setError("Indexing failed. Please try again.");
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
        }, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [channel, status, onComplete, indexedCount, startIndexing]);

    if (error) {
        return (
            <div className="glass-card p-6 text-center w-full max-w-xl">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--error)" }}>
                    Something went wrong
                </h3>
                <p className="mb-4 text-sm" style={{ color: "var(--foreground-muted)" }}>
                    {error}
                </p>
                {retryCount < MAX_RETRIES && (
                    <button
                        onClick={handleRetry}
                        className="btn-primary"
                    >
                        Retry ({MAX_RETRIES - retryCount} attempts left)
                    </button>
                )}
                {retryCount >= MAX_RETRIES && (
                    <p className="text-sm" style={{ color: "var(--warning)" }}>
                        Please check your configuration or try again later.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="glass-card p-6 w-full max-w-xl">
            <div className="flex items-center gap-4 mb-4">
                {channel.thumbnailUrl && (
                    <img
                        src={channel.thumbnailUrl}
                        alt={channel.title}
                        className="w-12 h-12 rounded-full"
                    />
                )}
                <div>
                    <h3 className="font-semibold text-lg">{channel.title}</h3>
                    <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                        {channel.handle}
                    </p>
                </div>
            </div>

            <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                    <span>
                        {isStale ? "⚠️ Taking longer than expected..." : "Loading videos..."}
                    </span>
                    <span>
                        {indexedCount.toLocaleString()} / {totalCount.toLocaleString()}
                    </span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="flex justify-between items-center">
                <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                    {status === "IN_PROGRESS"
                        ? isStale
                            ? "Hang tight, we're working on it..."
                            : "This may take a minute for large channels..."
                        : "Getting ready..."}
                </p>

                <div className="flex gap-2">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-500/30 text-red-500 hover:bg-red-500/10"
                        >
                            Cancel
                        </button>
                    )}
                    {isStale && (
                        <button
                            onClick={handleRetry}
                            className="btn-secondary text-sm px-3 py-1"
                        >
                            Retry
                        </button>
                    )}
                </div>
            </div>

            {retryCount > 0 && (
                <p className="text-xs mt-2" style={{ color: "var(--foreground-muted)" }}>
                    Retry attempt {retryCount} of {MAX_RETRIES}
                </p>
            )}
        </div>
    );
}
