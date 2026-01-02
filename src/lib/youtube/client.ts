import { prisma } from "../prisma";
import { parseDuration } from "../utils";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY;

// Quota costs per endpoint
const QUOTA_COSTS: Record<string, number> = {
    "channels.list": 1,
    "playlistItems.list": 1, // 50 videos per call
    "videos.list": 1,
    "search.list": 100, // Expensive - avoid!
};

interface YouTubeChannelResponse {
    items?: Array<{
        id: string;
        snippet: {
            title: string;
            customUrl?: string;
            thumbnails: { default?: { url: string } };
        };
        contentDetails: {
            relatedPlaylists: { uploads: string };
        };
        statistics: {
            videoCount: string;
        };
    }>;
}

interface YouTubePlaylistItemsResponse {
    items?: Array<{
        snippet: {
            resourceId: { videoId: string };
            title: string;
            description: string;
            thumbnails: { medium?: { url: string } };
            publishedAt: string;
        };
    }>;
    nextPageToken?: string;
}

interface YouTubeVideosResponse {
    items?: Array<{
        id: string;
        contentDetails: { duration: string };
        statistics: { viewCount: string };
    }>;
}

/**
 * Log API quota usage
 */
async function logQuota(endpoint: string, units: number) {
    await prisma.quotaLog.create({
        data: { endpoint, units },
    });
}

/**
 * Resolve a channel handle or ID to full channel info
 */
export async function resolveChannel(query: string) {
    if (!API_KEY) throw new Error("YouTube API key not configured");

    // Try by handle first
    let url = `${YOUTUBE_API_BASE}/channels?key=${API_KEY}&part=snippet,contentDetails,statistics`;

    if (query.startsWith("@")) {
        url += `&forHandle=${encodeURIComponent(query)}`;
    } else if (query.startsWith("UC")) {
        url += `&id=${encodeURIComponent(query)}`;
    } else {
        // Try as handle without @
        url += `&forHandle=${encodeURIComponent("@" + query)}`;
    }

    const res = await fetch(url);
    await logQuota("channels.list", QUOTA_COSTS["channels.list"]);

    if (!res.ok) {
        throw new Error(`YouTube API error: ${res.status}`);
    }

    const data: YouTubeChannelResponse = await res.json();

    if (!data.items?.length) {
        throw new Error("Channel not found");
    }

    const channel = data.items[0];
    return {
        youtubeId: channel.id,
        title: channel.snippet.title,
        handle: channel.snippet.customUrl || null,
        thumbnailUrl: channel.snippet.thumbnails.default?.url || null,
        uploadPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
        totalVideoCount: parseInt(channel.statistics.videoCount, 10),
    };
}

/**
 * Fetch videos from a channel's upload playlist
 * Uses the cheap playlistItems.list endpoint (1 unit per 50 videos)
 */
export async function fetchChannelVideos(
    uploadPlaylistId: string,
    pageToken?: string
): Promise<{ videos: Array<any>; nextPageToken?: string }> {
    if (!API_KEY) throw new Error("YouTube API key not configured");

    const url = new URL(`${YOUTUBE_API_BASE}/playlistItems`);
    url.searchParams.set("key", API_KEY);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("playlistId", uploadPlaylistId);
    url.searchParams.set("maxResults", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString());
    await logQuota("playlistItems.list", QUOTA_COSTS["playlistItems.list"]);

    if (!res.ok) {
        throw new Error(`YouTube API error: ${res.status}`);
    }

    const data: YouTubePlaylistItemsResponse = await res.json();

    const videoIds = data.items?.map((item) => item.snippet.resourceId.videoId) || [];

    // Get video details (duration, views) in batch
    const videoDetails = await getVideoDetails(videoIds);

    const videos =
        data.items?.map((item) => {
            const details = videoDetails.get(item.snippet.resourceId.videoId);
            return {
                youtubeVideoId: item.snippet.resourceId.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnailUrl: item.snippet.thumbnails.medium?.url || null,
                publishedAt: new Date(item.snippet.publishedAt),
                duration: details?.duration || 0,
                viewCount: BigInt(details?.viewCount || "0"),
            };
        }) || [];

    return {
        videos,
        nextPageToken: data.nextPageToken,
    };
}

/**
 * Get video details (duration, view count) in batch
 */
async function getVideoDetails(videoIds: string[]) {
    if (!API_KEY || videoIds.length === 0) return new Map();

    const url = new URL(`${YOUTUBE_API_BASE}/videos`);
    url.searchParams.set("key", API_KEY);
    url.searchParams.set("part", "contentDetails,statistics");
    url.searchParams.set("id", videoIds.join(","));

    const res = await fetch(url.toString());
    await logQuota("videos.list", QUOTA_COSTS["videos.list"]);

    if (!res.ok) {
        throw new Error(`YouTube API error: ${res.status}`);
    }

    const data: YouTubeVideosResponse = await res.json();

    const detailsMap = new Map<string, { duration: number; viewCount: string }>();

    data.items?.forEach((item) => {
        detailsMap.set(item.id, {
            duration: parseDuration(item.contentDetails.duration),
            viewCount: item.statistics.viewCount,
        });
    });

    return detailsMap;
}

/**
 * Get today's quota usage
 */
export async function getTodayQuotaUsage(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.quotaLog.aggregate({
        _sum: { units: true },
        where: { createdAt: { gte: today } },
    });

    return result._sum.units || 0;
}
