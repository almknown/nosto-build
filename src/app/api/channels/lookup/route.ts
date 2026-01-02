import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveChannel } from "@/lib/youtube/client";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
        return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    try {
        // Check cache first
        let channel = await prisma.channel.findFirst({
            where: {
                OR: [
                    { handle: query.startsWith("@") ? query : `@${query}` },
                    { youtubeId: query },
                ],
            },
        });

        let cached = false;
        if (channel) {
            // Check if cache is still valid (30 days)
            const cacheAge = Date.now() - channel.createdAt.getTime();
            if (cacheAge < 30 * 24 * 60 * 60 * 1000) {
                cached = true;
            }
        }

        if (!channel || !cached) {
            // Fetch from YouTube API
            const ytChannel = await resolveChannel(query);

            // Upsert in database
            channel = await prisma.channel.upsert({
                where: { youtubeId: ytChannel.youtubeId },
                update: {
                    title: ytChannel.title,
                    handle: ytChannel.handle,
                    thumbnailUrl: ytChannel.thumbnailUrl,
                    totalVideoCount: ytChannel.totalVideoCount,
                },
                create: {
                    youtubeId: ytChannel.youtubeId,
                    title: ytChannel.title,
                    handle: ytChannel.handle,
                    thumbnailUrl: ytChannel.thumbnailUrl,
                    uploadPlaylistId: ytChannel.uploadPlaylistId,
                    totalVideoCount: ytChannel.totalVideoCount,
                },
            });
        }

        return NextResponse.json({
            channelId: channel.youtubeId,
            title: channel.title,
            handle: channel.handle,
            thumbnailUrl: channel.thumbnailUrl,
            uploadPlaylistId: channel.uploadPlaylistId,
            indexStatus: channel.indexStatus,
            indexedVideoCount: channel.indexedVideoCount,
            totalVideoCount: channel.totalVideoCount,
            cached,
        });
    } catch (error) {
        console.error("Channel lookup error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Channel lookup failed" },
            { status: 500 }
        );
    }
}
