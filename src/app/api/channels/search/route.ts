import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const youtube = google.youtube("v3");

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
        return NextResponse.json({ results: [] });
    }

    try {
        const response = await youtube.search.list({
            key: process.env.YOUTUBE_API_KEY,
            part: ["snippet"],
            q: query,
            type: ["channel"],
            maxResults: 5,
        });

        const results = response.data.items?.map((item) => ({
            id: item.snippet?.channelId!,
            title: item.snippet?.title || "",
            handle: item.snippet?.customUrl || "", // customUrl might not be in snippet for search, but title is key
            thumbnailUrl: item.snippet?.thumbnails?.default?.url || "",
            description: item.snippet?.description || ""
        })) || [];

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Search API error:", error);
        // Return empty results on error to not break UI, but log it
        return NextResponse.json({ results: [] });
    }
}
