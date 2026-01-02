import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Debug endpoint to check indexing status of recent channels
 * GET /api/debug/indexing-status
 */
export async function GET() {
    try {
        const channels = await prisma.channel.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
                id: true,
                youtubeId: true,
                title: true,
                indexStatus: true,
                indexedVideoCount: true,
                totalVideoCount: true,
                lastSyncedAt: true,
                createdAt: true,
            },
        });

        const config = {
            qstashConfigured: !!process.env.QSTASH_TOKEN,
            signingKeysConfigured: !!(
                process.env.QSTASH_CURRENT_SIGNING_KEY &&
                process.env.QSTASH_NEXT_SIGNING_KEY
            ),
            youtubeApiConfigured: !!process.env.YOUTUBE_API_KEY,
            nextAuthUrl: process.env.NEXTAUTH_URL || "not set",
        };

        return NextResponse.json({
            channels,
            config,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Debug endpoint error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
