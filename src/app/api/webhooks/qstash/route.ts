import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { indexChannelVideos } from "@/lib/youtube/indexer";

const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "",
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();

        // Verify QStash signature
        const signature = request.headers.get("upstash-signature");
        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 401 });
        }

        const isValid = await receiver.verify({
            signature,
            body,
            url: request.url,
        });

        if (!isValid) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const payload = JSON.parse(body);
        const { channelId, uploadPlaylistId } = payload;

        if (!channelId || !uploadPlaylistId) {
            return NextResponse.json({ error: "Missing channelId or uploadPlaylistId" }, { status: 400 });
        }

        // Perform indexing
        await indexChannelVideos(channelId, uploadPlaylistId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("QStash webhook error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Webhook processing failed" },
            { status: 500 }
        );
    }
}
