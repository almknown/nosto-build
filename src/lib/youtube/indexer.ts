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
    try {
        // Get channel record
        const channel = await prisma.channel.findUnique({
            where: { youtubeId: channelYoutubeId },
        });

        if (!channel) {
            throw new Error("Channel not found");
        }

        let pageToken: string | undefined;
        let totalIndexed = 0;

        // Paginate through all videos
        do {
            const { videos, nextPageToken } = await fetchChannelVideos(uploadPlaylistId, pageToken);

            if (videos.length > 0) {
                // Batch upsert videos
                for (const video of videos) {
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
                }

                totalIndexed += videos.length;

                // Update progress
                await prisma.channel.update({
                    where: { youtubeId: channelYoutubeId },
                    data: { indexedVideoCount: totalIndexed },
                });
            }

            pageToken = nextPageToken;
        } while (pageToken);

        // Mark as complete
        await prisma.channel.update({
            where: { youtubeId: channelYoutubeId },
            data: {
                indexStatus: "COMPLETE",
                indexedVideoCount: totalIndexed,
                lastSyncedAt: new Date(),
            },
        });

        console.log(`Indexed ${totalIndexed} videos for channel ${channelYoutubeId}`);
    } catch (error) {
        console.error("Indexing error:", error);

        // Mark as failed
        await prisma.channel.update({
            where: { youtubeId: channelYoutubeId },
            data: { indexStatus: "FAILED" },
        });

        throw error;
    }
}
