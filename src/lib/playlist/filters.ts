import type { Video } from "@prisma/client";
import type { PlaylistFilters } from "@/types";

/**
 * Apply filters to a list of videos
 */
export function applyFilters(videos: Video[], filters: PlaylistFilters): Video[] {
    let result = [...videos];

    // Year range filter - start year
    if (filters.yearStart !== undefined) {
        const startDate = new Date(filters.yearStart, 0, 1);
        result = result.filter((v) => v.publishedAt >= startDate);
    }

    // Year range filter - end year
    if (filters.yearEnd !== undefined) {
        const endDate = new Date(filters.yearEnd, 11, 31, 23, 59, 59);
        result = result.filter((v) => v.publishedAt <= endDate);
    }

    // Keyword filter
    if (filters.keywords && filters.keywords.length > 0) {
        const lowerKeywords = filters.keywords.map((k) => k.toLowerCase());
        result = result.filter((v) => {
            const titleLower = v.title.toLowerCase();
            const descLower = (v.description || "").toLowerCase();
            return lowerKeywords.some((kw) => titleLower.includes(kw) || descLower.includes(kw));
        });
    }

    // Duration filter - minimum
    if (filters.minDuration !== undefined && filters.minDuration > 0) {
        result = result.filter((v) => v.duration >= filters.minDuration!);
    }

    // Duration filter - maximum
    if (filters.maxDuration !== undefined && filters.maxDuration > 0) {
        result = result.filter((v) => v.duration <= filters.maxDuration!);
    }

    // Exclude Shorts (videos under 60 seconds)
    if (filters.excludeShorts) {
        result = result.filter((v) => v.duration >= 60);
    }

    // Deep cuts: bottom 25% by view count
    if (filters.deepCuts && result.length > 0) {
        const sorted = [...result].sort((a, b) => Number(a.viewCount) - Number(b.viewCount));
        const cutoff = Math.ceil(sorted.length * 0.25);
        const threshold = sorted[cutoff - 1]?.viewCount ?? BigInt(0);
        result = result.filter((v) => v.viewCount <= threshold);
    }

    return result;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// Alias for backwards compatibility
export const shuffleVideos = shuffleArray;

