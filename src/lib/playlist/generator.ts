import { prisma } from "../prisma";
import type { Video } from "@prisma/client";
import type { PlaylistFilters } from "@/types";
import { applyFilters, shuffleArray } from "./filters";
import { selectVideosByTopic } from "../ai/topic-selector";

export interface GeneratedPlaylist {
    playlistId: string;
    watchUrl: string;
    videos: Array<{
        id: string;
        title: string;
        publishedAt: string;
        duration: number;
        viewCount: string;
        thumbnailUrl: string | null;
    }>;
    aiReasoning?: string;
}

/**
 * Generate a playlist from indexed channel videos
 * Supports both traditional filtering and AI-powered topic selection
 */
export async function generatePlaylist(
    channelId: string,
    filters: PlaylistFilters,
    count: number = 10,
    shuffle: boolean = true,
    userId?: string
): Promise<GeneratedPlaylist> {
    // Get channel from database
    const channel = await prisma.channel.findUnique({
        where: { youtubeId: channelId },
        include: { videos: true },
    });

    if (!channel) {
        throw new Error("Channel not found. Please index it first.");
    }

    if (channel.indexStatus !== "COMPLETE") {
        throw new Error("Channel indexing is not complete.");
    }

    if (channel.videos.length === 0) {
        throw new Error("No videos found for this channel.");
    }

    let selectedVideos: Video[];
    let aiReasoning: string | undefined;

    // Check if AI topic selection is requested
    if (filters.topicPrompt && filters.topicPrompt.trim().length > 0) {
        // Apply basic filters first (year range, duration, etc) to narrow down
        const preFiltered = applyFilters(channel.videos, {
            ...filters,
            // Remove topic-related filters for AI selection
            keywords: undefined,
            deepCuts: undefined,
        });

        if (preFiltered.length === 0) {
            throw new Error("No videos match your year/duration filters. Try adjusting them.");
        }

        // Use AI to select videos matching the topic
        const aiResult = await selectVideosByTopic(
            preFiltered.map(v => ({
                id: v.youtubeVideoId,
                title: v.title,
                description: v.description,
                publishedAt: v.publishedAt,
                duration: v.duration,
                viewCount: v.viewCount,
            })),
            filters.topicPrompt,
            count
        );

        // Map selected IDs back to video objects
        const selectedIds = new Set(aiResult.selectedVideoIds);
        selectedVideos = preFiltered.filter(v => selectedIds.has(v.youtubeVideoId));
        aiReasoning = aiResult.reasoning;

        // If AI returned fewer than requested, we RESPECT that choice (Quality over Quantity)
        // Do NOT backfill with random videos.
        if (selectedVideos.length < count) {
            console.log(`AI returned ${selectedVideos.length} videos (requested ${count}). Keeping strictly relevant results.`);
        }
    } else {
        // Traditional filter-based selection
        let filteredVideos = applyFilters(channel.videos, filters);

        if (filteredVideos.length === 0) {
            throw new Error("No videos match your filters. Try adjusting them.");
        }

        // Shuffle if requested
        if (shuffle) {
            filteredVideos = shuffleArray(filteredVideos);
        }

        // Take requested count
        selectedVideos = filteredVideos.slice(0, count);
    }

    // Generate YouTube watch URL
    const videoIds = selectedVideos.map((v) => v.youtubeVideoId);
    const watchUrl = `https://www.youtube.com/watch_videos?video_ids=${videoIds.join(",")}`;

    // Save to database if user is authenticated
    let playlistId = "";
    if (userId) {
        const saved = await prisma.generatedPlaylist.create({
            data: {
                videoIds,
                filters: filters as object,
                watchUrl,
                userId,
                channelId: channel.id,
            },
        });
        playlistId = saved.id;
    } else {
        playlistId = `temp_${Date.now()}`;
    }

    return {
        playlistId,
        watchUrl,
        videos: selectedVideos.map((v) => ({
            id: v.youtubeVideoId,
            title: v.title,
            publishedAt: v.publishedAt.toISOString(),
            duration: v.duration,
            viewCount: v.viewCount.toString(),
            thumbnailUrl: v.thumbnailUrl,
        })),
        aiReasoning,
    };
}
