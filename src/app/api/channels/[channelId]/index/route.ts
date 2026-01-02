import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Trim environment variables to prevent URL parsing errors from trailing/leading spaces
const QSTASH_URL = (process.env.QSTASH_URL || "https://qstash.upstash.io").trim();
const QSTASH_TOKEN = process.env.QSTASH_TOKEN?.trim();

interface RouteParams {
    params: Promise<{ channelId: string }>;
}

/**
 * Helper to perform synchronous indexing as fallback
 */
async function performSyncIndexing(channelYoutubeId: string, uploadPlaylistId: string): Promise<void> {
    const { indexChannelVideos } = await import("@/lib/youtube/indexer");
    await indexChannelVideos(channelYoutubeId, uploadPlaylistId);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const { channelId } = await params;

    try {
        // Find channel in database
        const channel = await prisma.channel.findUnique({
            where: { youtubeId: channelId },
        });

        if (!channel) {
            return NextResponse.json({ error: "Channel not found" }, { status: 404 });
        }

        // Check if already indexed or in progress
        if (channel.indexStatus === "COMPLETE") {
            return NextResponse.json({
                status: "already_complete",
                indexedVideoCount: channel.indexedVideoCount,
            });
        }

        if (channel.indexStatus === "IN_PROGRESS") {
            return NextResponse.json({
                status: "in_progress",
                indexedVideoCount: channel.indexedVideoCount,
            });
        }

        // Update status to in progress
        await prisma.channel.update({
            where: { youtubeId: channelId },
            data: { indexStatus: "IN_PROGRESS" },
        });

        // Trigger QStash webhook for serverless indexing
        if (QSTASH_TOKEN) {
            // Trim NEXTAUTH_URL to prevent URL parsing issues
            const baseUrl = (process.env.NEXTAUTH_URL || request.nextUrl.origin).trim();
            const webhookUrl = `${baseUrl}/api/webhooks/qstash`;
            const fullQstashUrl = `${QSTASH_URL}/v2/publish/${webhookUrl}`;

            // Validate URL before calling QStash
            try {
                new URL(fullQstashUrl);
            } catch {
                console.error("Invalid QStash URL:", fullQstashUrl);
                // Fall back to sync indexing
                console.warn("Invalid QStash URL configuration, falling back to synchronous indexing");
                await performSyncIndexing(channel.youtubeId, channel.uploadPlaylistId);
                return NextResponse.json({
                    status: "started",
                    message: "Indexing started (sync fallback due to config error)",
                });
            }

            try {
                const qstashRes = await fetch(fullQstashUrl, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${QSTASH_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        channelId: channel.youtubeId,
                        uploadPlaylistId: channel.uploadPlaylistId,
                    }),
                });

                if (!qstashRes.ok) {
                    const errorText = await qstashRes.text();
                    console.error("QStash error:", qstashRes.status, errorText);
                    // Fallback to sync indexing if QStash fails
                    console.warn("QStash request failed, falling back to synchronous indexing");
                    await performSyncIndexing(channel.youtubeId, channel.uploadPlaylistId);
                    return NextResponse.json({
                        status: "started",
                        message: "Indexing started (sync fallback)",
                    });
                }
            } catch (fetchError) {
                console.error("QStash fetch error:", fetchError);
                // Fallback to sync indexing
                console.warn("QStash network error, falling back to synchronous indexing");
                await performSyncIndexing(channel.youtubeId, channel.uploadPlaylistId);
                return NextResponse.json({
                    status: "started",
                    message: "Indexing started (sync fallback due to network error)",
                });
            }
        } else {
            // Fallback: index synchronously (not recommended for production)
            console.warn("QStash not configured, indexing synchronously");
            await performSyncIndexing(channel.youtubeId, channel.uploadPlaylistId);
        }

        return NextResponse.json({
            status: "started",
            message: "Indexing started",
        });
    } catch (error) {
        console.error("Index trigger error:", error);

        // Reset status to PENDING so user can retry
        try {
            await prisma.channel.update({
                where: { youtubeId: channelId },
                data: { indexStatus: "PENDING" },
            });
        } catch (resetError) {
            console.error("Failed to reset channel status:", resetError);
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to start indexing" },
            { status: 500 }
        );
    }
}

// GET endpoint to check indexing status
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { channelId } = await params;

    try {
        const channel = await prisma.channel.findUnique({
            where: { youtubeId: channelId },
            select: {
                indexStatus: true,
                indexedVideoCount: true,
                totalVideoCount: true,
                lastSyncedAt: true,
            },
        });

        if (!channel) {
            return NextResponse.json({ error: "Channel not found" }, { status: 404 });
        }

        return NextResponse.json(channel);
    } catch (error) {
        console.error("Status check error:", error);
        return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
    }
}
