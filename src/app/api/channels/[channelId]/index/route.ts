import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const QSTASH_URL = process.env.QSTASH_URL || "https://qstash.upstash.io";
const QSTASH_TOKEN = process.env.QSTASH_TOKEN;

interface RouteParams {
    params: Promise<{ channelId: string }>;
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
            const webhookUrl = `${process.env.NEXTAUTH_URL || request.nextUrl.origin}/api/webhooks/qstash`;

            await fetch(`${QSTASH_URL}/v2/publish/${webhookUrl}`, {
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
        } else {
            // Fallback: index synchronously (not recommended for production)
            console.warn("QStash not configured, indexing synchronously");
            // Import dynamically to avoid circular dependencies
            const { indexChannelVideos } = await import("@/lib/youtube/indexer");
            await indexChannelVideos(channel.youtubeId, channel.uploadPlaylistId);
        }

        return NextResponse.json({
            status: "started",
            message: "Indexing started",
        });
    } catch (error) {
        console.error("Index trigger error:", error);
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
