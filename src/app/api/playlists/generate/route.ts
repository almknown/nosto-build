import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generatePlaylist } from "@/lib/playlist/generator";
import { checkRateLimit } from "@/lib/rate-limit";
import { GeneratePlaylistSchema } from "@/types";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const body = await request.json();

        // Validate input
        const parsed = GeneratePlaylistSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { channelId, filters, count, shuffle } = parsed.data;

        // Check rate limit for authenticated users
        let userId: string | undefined;
        if (session?.user?.id) {
            userId = session.user.id;
            const rateLimit = await checkRateLimit(userId);
            if (!rateLimit.allowed) {
                return NextResponse.json(
                    {
                        error: "Daily limit reached",
                        remaining: rateLimit.remaining,
                        resetAt: rateLimit.resetAt.toISOString(),
                    },
                    { status: 429 }
                );
            }
        }

        // Generate playlist
        const playlist = await generatePlaylist(channelId, filters, count, shuffle, userId);

        return NextResponse.json(playlist);
    } catch (error) {
        console.error("Playlist generation error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to generate playlist" },
            { status: 500 }
        );
    }
}
