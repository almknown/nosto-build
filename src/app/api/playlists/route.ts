import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const playlists = await prisma.generatedPlaylist.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 50,
            include: {
                user: {
                    select: { id: true },
                },
            },
        });

        // Get channel info for each playlist
        const channelIds = [...new Set(playlists.map((p: typeof playlists[0]) => p.channelId))];
        const channels = await prisma.channel.findMany({
            where: { id: { in: channelIds } },
            select: {
                id: true,
                youtubeId: true,
                title: true,
                thumbnailUrl: true,
            },
        });

        const channelMap = new Map(channels.map((c: typeof channels[0]) => [c.id, c]));

        const response = playlists.map((p: typeof playlists[0]) => ({
            id: p.id,
            name: p.name,
            videoIds: p.videoIds,
            videoCount: p.videoIds.length,
            filters: p.filters,
            watchUrl: p.watchUrl,
            channelId: p.channelId,
            channel: channelMap.get(p.channelId) || null,
            createdAt: p.createdAt.toISOString(),
        }));

        return NextResponse.json({ playlists: response });
    } catch (error) {
        console.error("History fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
