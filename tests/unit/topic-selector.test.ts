/**
 * Tests for AI Topic Selector
 * Note: These test the fallback keyword matching since we can't mock Gemini API easily
 */

// Mock the Google Generative AI module
jest.mock("@google/generative-ai", () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: jest.fn().mockRejectedValue(new Error("API not available")),
        }),
    })),
}));

// We need to import after mocking
import { selectVideosByTopic } from "@/lib/ai/topic-selector";

// Mock video factory
function createMockVideo(overrides: Partial<{
    id: string;
    title: string;
    description: string | null;
    publishedAt: Date;
    duration: number;
    viewCount: bigint;
}> = {}) {
    return {
        id: overrides.id || "video123",
        title: overrides.title || "Test Video Title",
        description: overrides.description ?? "Test description",
        publishedAt: overrides.publishedAt || new Date("2020-06-15"),
        duration: overrides.duration || 600,
        viewCount: overrides.viewCount || BigInt(100000),
    };
}

describe("selectVideosByTopic", () => {
    describe("fallback keyword matching", () => {
        it("returns videos matching keywords in title", async () => {
            const videos = [
                createMockVideo({ id: "v1", title: "Teemo Build Guide" }),
                createMockVideo({ id: "v2", title: "Minecraft Adventure" }),
                createMockVideo({ id: "v3", title: "Teemo Gameplay Highlights" }),
            ];

            const result = await selectVideosByTopic(videos, "Teemo gameplay", 5);

            expect(result.selectedVideoIds).toContain("v1");
            expect(result.selectedVideoIds).toContain("v3");
            expect(result.selectedVideoIds).not.toContain("v2");
        });

        it("returns videos matching keywords in description", async () => {
            const videos = [
                createMockVideo({ id: "v1", title: "Game Video", description: "Playing Teemo today" }),
                createMockVideo({ id: "v2", title: "Other Video", description: "Random content" }),
            ];

            const result = await selectVideosByTopic(videos, "Teemo", 5);

            expect(result.selectedVideoIds).toContain("v1");
            expect(result.selectedVideoIds).not.toContain("v2");
        });

        it("prioritizes title matches over description matches", async () => {
            const videos = [
                createMockVideo({ id: "v1", title: "Random Title", description: "Teemo guide" }),
                createMockVideo({ id: "v2", title: "Teemo Guide", description: "Random description" }),
            ];

            const result = await selectVideosByTopic(videos, "Teemo", 5);

            // v2 should be first (title match = 3 points) vs v1 (description match = 1 point)
            expect(result.selectedVideoIds[0]).toBe("v2");
        });

        it("respects maxVideos limit", async () => {
            const videos = Array.from({ length: 20 }, (_, i) =>
                createMockVideo({ id: `v${i}`, title: `Teemo Video ${i}` })
            );

            const result = await selectVideosByTopic(videos, "Teemo", 5);

            expect(result.selectedVideoIds).toHaveLength(5);
        });

        it("returns random selection when no keywords match", async () => {
            const videos = [
                createMockVideo({ id: "v1", title: "Video One" }),
                createMockVideo({ id: "v2", title: "Video Two" }),
                createMockVideo({ id: "v3", title: "Video Three" }),
            ];

            const result = await selectVideosByTopic(videos, "nonexistent topic xyz", 2);

            expect(result.selectedVideoIds).toHaveLength(2);
            expect(result.reasoning).toContain("random");
        });

        it("handles multiple keywords (OR logic)", async () => {
            const videos = [
                createMockVideo({ id: "v1", title: "Teemo Guide" }),
                createMockVideo({ id: "v2", title: "Garen Guide" }),
                createMockVideo({ id: "v3", title: "Random Video" }),
            ];

            const result = await selectVideosByTopic(videos, "Teemo Garen", 5);

            expect(result.selectedVideoIds).toContain("v1");
            expect(result.selectedVideoIds).toContain("v2");
            expect(result.selectedVideoIds).not.toContain("v3");
        });

        it("is case-insensitive", async () => {
            const videos = [
                createMockVideo({ id: "v1", title: "TEEMO GUIDE" }),
                createMockVideo({ id: "v2", title: "teemo gameplay" }),
            ];

            const result = await selectVideosByTopic(videos, "Teemo", 5);

            expect(result.selectedVideoIds).toContain("v1");
            expect(result.selectedVideoIds).toContain("v2");
        });

        it("filters short keywords (< 3 chars)", async () => {
            const videos = [
                createMockVideo({ id: "v1", title: "A Guide" }),
                createMockVideo({ id: "v2", title: "Random" }),
            ];

            // "A" and "is" should be filtered out, only "guide" should match
            const result = await selectVideosByTopic(videos, "A guide is", 5);

            expect(result.selectedVideoIds).toContain("v1");
        });
    });
});

describe("PlaylistFilters with topicPrompt", () => {
    it("topicPrompt is optional in schema", async () => {
        const { PlaylistFiltersSchema } = await import("@/types");

        const validWithPrompt = PlaylistFiltersSchema.safeParse({
            topicPrompt: "Teemo gameplay",
            yearStart: 2020,
        });
        expect(validWithPrompt.success).toBe(true);

        const validWithoutPrompt = PlaylistFiltersSchema.safeParse({
            yearStart: 2020,
        });
        expect(validWithoutPrompt.success).toBe(true);
    });

    it("topicPrompt max length is 500", async () => {
        const { PlaylistFiltersSchema } = await import("@/types");

        const tooLong = PlaylistFiltersSchema.safeParse({
            topicPrompt: "x".repeat(501),
        });
        expect(tooLong.success).toBe(false);

        const justRight = PlaylistFiltersSchema.safeParse({
            topicPrompt: "x".repeat(500),
        });
        expect(justRight.success).toBe(true);
    });
});

describe("GeneratePlaylistSchema count limits", () => {
    it("count defaults to 10", async () => {
        const { GeneratePlaylistSchema } = await import("@/types");

        const result = GeneratePlaylistSchema.parse({
            channelId: "test123",
            filters: {},
        });

        expect(result.count).toBe(10);
    });

    it("count min is 1, max is 25", async () => {
        const { GeneratePlaylistSchema } = await import("@/types");

        const validMin = GeneratePlaylistSchema.safeParse({
            channelId: "test",
            filters: {},
            count: 1,
        });
        expect(validMin.success).toBe(true);

        const validMax = GeneratePlaylistSchema.safeParse({
            channelId: "test",
            filters: {},
            count: 25,
        });
        expect(validMax.success).toBe(true);

        const tooLow = GeneratePlaylistSchema.safeParse({
            channelId: "test",
            filters: {},
            count: 0,
        });
        expect(tooLow.success).toBe(false);

        const tooHigh = GeneratePlaylistSchema.safeParse({
            channelId: "test",
            filters: {},
            count: 26,
        });
        expect(tooHigh.success).toBe(false);
    });
});
