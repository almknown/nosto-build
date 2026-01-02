import { prisma } from "@/lib/prisma";
import { fetchChannelVideos } from "./client";

/**
 * Index all videos from a channel's upload playlist
 * Called by QStash webhook or synchronously as fallback
 */
export async function indexChannelVideos(
    channelYoutubeId: string,
    uploadPlaylistId: string
): Promise<void> {
    console.log(`[INDEXER] Starting indexing for channel ${channelYoutubeId}, playlist ${uploadPlaylistId}`);
    const startTime = Date.now();

    try {
        // Get channel record
        const channel = await prisma.channel.findUnique({
            where: { youtubeId: channelYoutubeId },
        });

        if (!channel) {
            console.error(`[INDEXER] Channel not found: ${channelYoutubeId}`);
            throw new Error("Channel not found");
        }

        console.log(`[INDEXER] Found channel: ${channel.title} (ID: ${channel.id})`);

        let pageToken: string | undefined;
        let totalIndexed = 0;
        let pageCount = 0;

        // Paginate through all videos
        do {
            pageCount++;
            console.log(`[INDEXER] Fetching page ${pageCount}${pageToken ? ` (token: ${pageToken.slice(0, 10)}...)` : ''}`);

            try {
                const { videos, nextPageToken } = await fetchChannelVideos(uploadPlaylistId, pageToken);
                console.log(`[INDEXER] Page ${pageCount}: Received ${videos.length} videos, nextPageToken: ${nextPageToken ? 'yes' : 'no'}`);

                if (videos.length > 0) {
                    // Batch upsert videos
                    for (const video of videos) {
                        try {
                            await prisma.video.upsert({
                                where: { youtubeVideoId: video.youtubeVideoId },
                                update: {
                                    title: video.title,
                                    description: video.description,
                                    thumbnailUrl: video.thumbnailUrl,
                                    viewCount: video.viewCount,
                                },
                                create: {
                                    youtubeVideoId: video.youtubeVideoId,
                                    title: video.title,
                                    description: video.description,
                                    thumbnailUrl: video.thumbnailUrl,
                                    publishedAt: video.publishedAt,
                                    duration: video.duration,
                                    viewCount: video.viewCount,
                                    channelId: channel.id,
                                },
                            });
                        } catch (videoError) {
                            console.error(`[INDEXER] Failed to upsert video ${video.youtubeVideoId}:`, videoError);
                            // Continue with other videos even if one fails
                        }
                    }

                    totalIndexed += videos.length;
                    console.log(`[INDEXER] Progress: ${totalIndexed} videos indexed so far`);

                    // Update progress
                    try {
                        await prisma.channel.update({
                            where: { youtubeId: channelYoutubeId },
                            data: { indexedVideoCount: totalIndexed },
                        });
                        console.log(`[INDEXER] Updated channel progress to ${totalIndexed}`);
                    } catch (updateError) {
                        console.error(`[INDEXER] Failed to update channel progress:`, updateError);
                    }
                }

                pageToken = nextPageToken;
            } catch (pageError) {
                console.error(`[INDEXER] Error fetching page ${pageCount}:`, pageError);
                throw pageError;
            }
        } while (pageToken);

        // Mark as complete
        console.log(`[INDEXER] Indexing complete, marking channel as COMPLETE`);
        await prisma.channel.update({
            where: { youtubeId: channelYoutubeId },
            data: {
                indexStatus: "COMPLETE",
                indexedVideoCount: totalIndexed,
                lastSyncedAt: new Date(),
            },
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[INDEXER] ✅ Successfully indexed ${totalIndexed} videos for channel ${channelYoutubeId} in ${duration}s`);
    } catch (error) {
        console.error(`[INDEXER] ❌ Indexing error for channel ${channelYoutubeId}:`, error);
        console.error(`[INDEXER] Error details:`, {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });

        // Mark as failed
        try {
            await prisma.channel.update({
                where: { youtubeId: channelYoutubeId },
                data: { indexStatus: "FAILED" },
            });
            console.log(`[INDEXER] Marked channel ${channelYoutubeId} as FAILED`);
        } catch (updateError) {
            console.error(`[INDEXER] Failed to mark channel as FAILED:`, updateError);
        }

        throw error;
    }
}
