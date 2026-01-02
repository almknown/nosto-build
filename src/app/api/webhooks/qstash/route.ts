import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { indexChannelVideos } from "@/lib/youtube/indexer";

const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "",
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
});

export async function POST(request: NextRequest) {
    console.log('[QSTASH] Webhook triggered');

    try {
        const body = await request.text();
        console.log('[QSTASH] Request body length:', body.length);

        // Verify QStash signature
        const signature = request.headers.get("upstash-signature");
        if (!signature) {
            console.error('[QSTASH] Missing signature header');
            return NextResponse.json({ error: "Missing signature" }, { status: 401 });
        }

        console.log('[QSTASH] Signature present, verifying...');
        const isValid = await receiver.verify({
            signature,
            body,
            url: request.url,
        });

        if (!isValid) {
            console.error('[QSTASH] Invalid signature');
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        console.log('[QSTASH] Signature verified ✓');

        const payload = JSON.parse(body);
        const { channelId, uploadPlaylistId } = payload;
        console.log('[QSTASH] Payload:', { channelId, uploadPlaylistId });

        if (!channelId || !uploadPlaylistId) {
            console.error('[QSTASH] Missing required fields in payload');
            return NextResponse.json({ error: "Missing channelId or uploadPlaylistId" }, { status: 400 });
        }

        // Perform indexing
        console.log('[QSTASH] Starting indexing...');
        await indexChannelVideos(channelId, uploadPlaylistId);
        console.log('[QSTASH] Indexing completed successfully ✓');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[QSTASH] Webhook error:", error);
        console.error("[QSTASH] Error details:", {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });

        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Webhook processing failed" },
            { status: 500 }
        );
    }
}
