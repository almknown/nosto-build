import { applyFilters, shuffleArray } from "@/lib/playlist/filters";
import { Video } from "@prisma/client";

// Mock video factory
function createMockVideo(overrides: Partial<Video> = {}): Video {
    return {
        id: "test-id",
        youtubeVideoId: "abc123",
        title: "Test Video",
        description: "Test description",
        thumbnailUrl: "https://example.com/thumb.jpg",
        publishedAt: new Date("2020-06-15T12:00:00Z"),
        duration: 600, // 10 minutes
        viewCount: BigInt(100000),
        channelId: "channel-123",
        ...overrides,
    };
}

describe("applyFilters", () => {
    describe("year range filters", () => {
        it("filters videos by yearStart", () => {
            const videos = [
                createMockVideo({ publishedAt: new Date("2018-06-15T12:00:00Z") }),
                createMockVideo({ publishedAt: new Date("2020-06-15T12:00:00Z") }),
                createMockVideo({ publishedAt: new Date("2022-06-15T12:00:00Z") }),
            ];

            const result = applyFilters(videos, { yearStart: 2020 });
            expect(result).toHaveLength(2);
            expect(result[0].publishedAt.getFullYear()).toBeGreaterThanOrEqual(2020);
        });

        it("filters videos by yearEnd", () => {
            const videos = [
                createMockVideo({ publishedAt: new Date("2018-06-15T12:00:00Z") }),
                createMockVideo({ publishedAt: new Date("2020-06-15T12:00:00Z") }),
                createMockVideo({ publishedAt: new Date("2022-06-15T12:00:00Z") }),
            ];

            const result = applyFilters(videos, { yearEnd: 2019 });
            expect(result).toHaveLength(1);
            expect(result[0].publishedAt.getFullYear()).toBeLessThanOrEqual(2019);
        });

        it("filters videos by year range", () => {
            const videos = [
                createMockVideo({ publishedAt: new Date("2018-06-15T12:00:00Z") }),
                createMockVideo({ publishedAt: new Date("2019-06-15T12:00:00Z") }),
                createMockVideo({ publishedAt: new Date("2020-06-15T12:00:00Z") }),
                createMockVideo({ publishedAt: new Date("2022-06-15T12:00:00Z") }),
            ];

            const result = applyFilters(videos, { yearStart: 2019, yearEnd: 2020 });
            expect(result).toHaveLength(2);
        });
    });

    describe("duration filters", () => {
        it("filters by minDuration", () => {
            const videos = [
                createMockVideo({ duration: 30 }),   // 30 seconds
                createMockVideo({ duration: 300 }),  // 5 minutes
                createMockVideo({ duration: 900 }),  // 15 minutes
            ];

            const result = applyFilters(videos, { minDuration: 120 }); // 2+ minutes
            expect(result).toHaveLength(2);
        });

        it("filters by maxDuration", () => {
            const videos = [
                createMockVideo({ duration: 30 }),
                createMockVideo({ duration: 300 }),
                createMockVideo({ duration: 900 }),
            ];

            const result = applyFilters(videos, { maxDuration: 600 }); // max 10 min
            expect(result).toHaveLength(2);
        });

        it("excludeShorts removes videos under 60 seconds", () => {
            const videos = [
                createMockVideo({ duration: 45 }),
                createMockVideo({ duration: 59 }),
                createMockVideo({ duration: 60 }),
                createMockVideo({ duration: 300 }),
            ];

            const result = applyFilters(videos, { excludeShorts: true });
            expect(result).toHaveLength(2);
            expect(result.every((v) => v.duration >= 60)).toBe(true);
        });
    });

    describe("keyword filter", () => {
        it("filters by keywords in title", () => {
            const videos = [
                createMockVideo({ title: "Minecraft Speedrun" }),
                createMockVideo({ title: "Fortnite Victory" }),
                createMockVideo({ title: "Ultimate Minecraft Challenge" }),
            ];

            const result = applyFilters(videos, { keywords: ["minecraft"] });
            expect(result).toHaveLength(2);
        });

        it("filters by keywords in description", () => {
            const videos = [
                createMockVideo({ title: "Gaming Video", description: "Playing minecraft today" }),
                createMockVideo({ title: "Another Video", description: "Random stuff" }),
            ];

            const result = applyFilters(videos, { keywords: ["minecraft"] });
            expect(result).toHaveLength(1);
        });

        it("keyword search is case-insensitive", () => {
            const videos = [
                createMockVideo({ title: "MINECRAFT GAMEPLAY" }),
                createMockVideo({ title: "Minecraft gameplay" }),
            ];

            const result = applyFilters(videos, { keywords: ["MineCraft"] });
            expect(result).toHaveLength(2);
        });

        it("matches any keyword (OR logic)", () => {
            const videos = [
                createMockVideo({ title: "Minecraft" }),
                createMockVideo({ title: "Fortnite" }),
                createMockVideo({ title: "Valorant" }),
            ];

            const result = applyFilters(videos, { keywords: ["minecraft", "fortnite"] });
            expect(result).toHaveLength(2);
        });
    });

    describe("deep cuts filter", () => {
        it("returns bottom 25% by view count", () => {
            const videos = [
                createMockVideo({ viewCount: BigInt(1000000) }),
                createMockVideo({ viewCount: BigInt(500000) }),
                createMockVideo({ viewCount: BigInt(100000) }),
                createMockVideo({ viewCount: BigInt(50000) }),
                createMockVideo({ viewCount: BigInt(10000) }),
                createMockVideo({ viewCount: BigInt(5000) }),
                createMockVideo({ viewCount: BigInt(1000) }),
                createMockVideo({ viewCount: BigInt(500) }),
            ];

            const result = applyFilters(videos, { deepCuts: true });
            // Bottom 25% of 8 = 2 videos
            expect(result).toHaveLength(2);
            // Should be the lowest view count videos
            expect(result.every((v) => Number(v.viewCount) <= 1000)).toBe(true);
        });
    });

    describe("combined filters", () => {
        it("applies multiple filters together", () => {
            const videos = [
                createMockVideo({
                    title: "Old Minecraft Video",
                    publishedAt: new Date("2015-06-15T12:00:00Z"),
                    duration: 600,
                }),
                createMockVideo({
                    title: "New Minecraft Short",
                    publishedAt: new Date("2023-06-15T12:00:00Z"),
                    duration: 30,
                }),
                createMockVideo({
                    title: "Old Fortnite Video",
                    publishedAt: new Date("2018-06-15T12:00:00Z"),
                    duration: 900,
                }),
            ];

            const result = applyFilters(videos, {
                yearEnd: 2020,
                keywords: ["minecraft"],
                excludeShorts: true,
            });

            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("Old Minecraft Video");
        });
    });
});

describe("shuffleArray", () => {
    it("returns an array of the same length", () => {
        const input = [1, 2, 3, 4, 5];
        const result = shuffleArray(input);
        expect(result).toHaveLength(input.length);
    });

    it("contains all original elements", () => {
        const input = [1, 2, 3, 4, 5];
        const result = shuffleArray(input);
        expect(result.sort()).toEqual(input.sort());
    });

    it("does not modify the original array", () => {
        const input = [1, 2, 3, 4, 5];
        const originalCopy = [...input];
        shuffleArray(input);
        expect(input).toEqual(originalCopy);
    });
});
