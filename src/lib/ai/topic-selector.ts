import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

interface VideoMetadata {
    id: string;
    title: string;
    description: string | null;
    publishedAt: Date;
    duration: number;
    viewCount: bigint;
}

interface TopicSelectionResult {
    selectedVideoIds: string[];
    reasoning?: string;
}

/**
 * Use Gemini AI to select videos matching a user's topic prompt
 */
export async function selectVideosByTopic(
    videos: VideoMetadata[],
    topicPrompt: string,
    maxVideos: number = 10
): Promise<TopicSelectionResult> {
    if (!GEMINI_API_KEY) {
        console.warn("Gemini API key not configured, falling back to keyword matching");
        return fallbackKeywordMatching(videos, topicPrompt, maxVideos);
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Prepare video metadata for AI (limit to avoid token limits)
        const videoSummaries = videos.slice(0, 200).map((v, idx) => ({
            idx,
            id: v.id,
            title: v.title,
            desc: v.description?.slice(0, 150) || "",
            year: v.publishedAt.getFullYear(),
            views: Number(v.viewCount),
        }));

        const prompt = `You are a video curator. Given a list of YouTube videos and a user's request, select the ${maxVideos} best matching videos.

User's Request: "${topicPrompt}"

Videos (JSON array with idx, id, title, desc, year, views):
${JSON.stringify(videoSummaries, null, 0)}

Respond with ONLY a JSON object in this exact format, no markdown:
{"selectedIds": ["id1", "id2", ...], "reasoning": "brief explanation"}

Select videos that best match the user's request. Consider:
- Title relevance to the topic
- Description content
- Prefer variety if multiple videos match
- If the user specifies a time range, respect it

Return exactly ${maxVideos} video IDs (or fewer if not enough match).`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Parse JSON response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.warn("Could not parse AI response, falling back");
            return fallbackKeywordMatching(videos, topicPrompt, maxVideos);
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Validate that returned IDs exist in our video list
        const validIds = new Set(videos.map(v => v.id));
        const selectedIds = (parsed.selectedIds || []).filter((id: string) => validIds.has(id));

        if (selectedIds.length === 0) {
            console.warn("AI returned no valid IDs, falling back");
            return fallbackKeywordMatching(videos, topicPrompt, maxVideos);
        }

        return {
            selectedVideoIds: selectedIds.slice(0, maxVideos),
            reasoning: parsed.reasoning,
        };
    } catch (error) {
        console.error("Gemini API error:", error);
        return fallbackKeywordMatching(videos, topicPrompt, maxVideos);
    }
}

/**
 * Fallback: simple keyword matching when AI is unavailable
 */
function fallbackKeywordMatching(
    videos: VideoMetadata[],
    topicPrompt: string,
    maxVideos: number
): TopicSelectionResult {
    const keywords = topicPrompt.toLowerCase().split(/\s+/).filter(k => k.length > 2);

    const scored = videos.map(video => {
        const titleLower = video.title.toLowerCase();
        const descLower = (video.description || "").toLowerCase();

        let score = 0;
        for (const keyword of keywords) {
            if (titleLower.includes(keyword)) score += 3;
            if (descLower.includes(keyword)) score += 1;
        }

        return { video, score };
    });

    // Sort by score descending, then by views for tiebreaker
    scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return Number(b.video.viewCount) - Number(a.video.viewCount);
    });

    const selected = scored
        .filter(s => s.score > 0)
        .slice(0, maxVideos)
        .map(s => s.video.id);

    // If no matches, return random selection
    if (selected.length === 0) {
        const shuffled = [...videos].sort(() => Math.random() - 0.5);
        return {
            selectedVideoIds: shuffled.slice(0, maxVideos).map(v => v.id),
            reasoning: "No keyword matches found, returning random selection",
        };
    }

    return {
        selectedVideoIds: selected,
        reasoning: `Matched ${selected.length} videos using keywords: ${keywords.join(", ")}`,
    };
}
