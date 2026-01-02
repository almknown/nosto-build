import { z } from "zod";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API Schemas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PlaylistFiltersSchema = z.object({
    yearStart: z.number().int().min(2005).max(2030).optional(),
    yearEnd: z.number().int().min(2005).max(2030).optional(),
    keywords: z.array(z.string()).optional(),
    minDuration: z.number().int().min(0).optional(), // seconds
    maxDuration: z.number().int().min(0).optional(), // seconds
    deepCuts: z.boolean().optional(), // Bottom 25% by view count
    excludeShorts: z.boolean().optional(),
    topicPrompt: z.string().max(500).optional(), // AI topic selection prompt
});

export const GeneratePlaylistSchema = z.object({
    channelId: z.string().min(1),
    filters: PlaylistFiltersSchema,
    count: z.number().int().min(1).max(25).default(10),
    shuffle: z.boolean().default(true),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type PlaylistFilters = z.infer<typeof PlaylistFiltersSchema>;
export type GeneratePlaylistInput = z.infer<typeof GeneratePlaylistSchema>;

export interface ChannelResponse {
    channelId: string;
    title: string;
    handle: string | null;
    thumbnailUrl: string | null;
    uploadPlaylistId: string;
    indexStatus: "PENDING" | "IN_PROGRESS" | "COMPLETE" | "FAILED";
    indexedVideoCount: number;
    totalVideoCount: number;
    cached: boolean;
}

export interface VideoResponse {
    id: string;
    title: string;
    publishedAt: string;
    duration: number;
    viewCount: string;
    thumbnailUrl: string | null;
}

export interface GeneratedPlaylistResponse {
    playlistId: string;
    watchUrl: string;
    videos: VideoResponse[];
}
