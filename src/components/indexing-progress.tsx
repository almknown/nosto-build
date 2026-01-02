"use client";

import { useState, useEffect } from "react";
import type { ChannelResponse } from "@/types";

interface IndexingProgressProps {
    channel: ChannelResponse;
    onComplete: (channel: ChannelResponse) => void;
}

export default function IndexingProgress({ channel, onComplete }: IndexingProgressProps) {
    const [status, setStatus] = useState(channel.indexStatus);
    const [indexedCount, setIndexedCount] = useState(channel.indexedVideoCount);
    const [error, setError] = useState<string | null>(null);

    const totalCount = channel.totalVideoCount || 1;
    const progress = Math.min((indexedCount / totalCount) * 100, 100);

    useEffect(() => {
        if (status === "COMPLETE") {
            onComplete({ ...channel, indexStatus: "COMPLETE", indexedVideoCount: indexedCount });
            return;
        }

        if (status === "PENDING") {
            // Start indexing
            fetch(`/api/channels/${channel.channelId}/index`, { method: "POST" })
                .then((res) => res.json())
                .then((data) => {
                    console.log("Index trigger response:", data);
                    if (data.error) {
                        setError(data.error);
                        return;
                    }
                    // API returns 'started', 'already_complete', or 'in_progress'
                    if (data.status === "started" || data.status === "in_progress") {
                        setStatus("IN_PROGRESS");
                    } else if (data.status === "already_complete") {
                        setStatus("COMPLETE");
                        setIndexedCount(data.indexedVideoCount || indexedCount);
                    }
                })
                .catch((e) => {
                    console.error("Index trigger error:", e);
                    setError(e.message || "Failed to start indexing");
                });
        }

        // Poll for progress
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/channels/${channel.channelId}/index`);
                const data = await res.json();

                setStatus(data.indexStatus);
                setIndexedCount(data.indexedVideoCount);

                if (data.indexStatus === "COMPLETE") {
                    clearInterval(interval);
                    onComplete({ ...channel, ...data });
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [channel, status, onComplete, indexedCount]);

    if (error) {
        return (
            <div className="glass-card p-6 text-center">
                <p style={{ color: "var(--error)" }}>{error}</p>
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
                    <span>Indexing videos...</span>
                    <span>
                        {indexedCount.toLocaleString()} / {totalCount.toLocaleString()}
                    </span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                {status === "IN_PROGRESS"
                    ? "This may take a minute for large channels..."
                    : "Starting indexer..."}
            </p>
        </div>
    );
}
