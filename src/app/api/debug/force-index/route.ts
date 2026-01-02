import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { indexChannelVideos } from "@/lib/youtube/indexer";

/**
 * Debug endpoint to manually trigger synchronous indexing
 * POST /api/debug/force-index
 * Body: { "channelId": "UCxxx" }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { channelId } = body;

        if (!channelId) {
            return NextResponse.json({ error: "channelId is required" }, { status: 400 });
        }

        const channel = await prisma.channel.findUnique({
            where: { youtubeId: channelId },
        });

        if (!channel) {
            return NextResponse.json({ error: "Channel not found" }, { status: 404 });
        }

        console.log(`[DEBUG] Force indexing channel: ${channelId}`);
        console.log(`[DEBUG] Upload playlist: ${channel.uploadPlaylistId}`);

        // Reset status first
        await prisma.channel.update({
            where: { youtubeId: channelId },
            data: {
                indexStatus: "IN_PROGRESS",
                indexedVideoCount: 0,
            },
        });

        // Perform synchronous indexing
        await indexChannelVideos(channelId, channel.uploadPlaylistId);

        // Get updated channel
        const updatedChannel = await prisma.channel.findUnique({
            where: { youtubeId: channelId },
        });

        return NextResponse.json({
            success: true,
            message: "Indexing completed",
            channel: updatedChannel,
        });
    } catch (error) {
        console.error("[DEBUG] Force index error:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Indexing failed",
                stack: process.env.NODE_ENV === "development"
                    ? (error instanceof Error ? error.stack : undefined)
                    : undefined,
            },
            { status: 500 }
        );
    }
}
