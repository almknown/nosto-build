/**
 * @jest-environment node
 */
import { describe, it, expect, beforeAll } from '@jest/globals';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables for API key BEFORE importing the module
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Declare variable to hold the imported function
let selectVideosByTopic: any;

beforeAll(async () => {
    // Dynamic import to ensure env vars are set
    const module = await import('../../src/lib/ai/topic-selector');
    selectVideosByTopic = module.selectVideosByTopic;
});

// Mock Video Data
const CPT_PIANTA_VIDEOS = [
    { id: 'v1', title: 'I can\'t play League of Legends anymore', description: 'Sad vlog', publishedAt: new Date('2024-01-01'), duration: 600, viewCount: 1000000n },
    { id: 'v2', title: 'League of Legends: Unexpected AP Irelia [OP XD GUIDE]', description: 'Guide', publishedAt: new Date('2018-01-01'), duration: 600, viewCount: 500000n },
    { id: 'v3', title: 'Lethality Only!! RAMMUS |#15| League Of Legends', description: 'Build video', publishedAt: new Date('2017-01-01'), duration: 600, viewCount: 500000n },
    { id: 'v4', title: 'Thornmail Only! RAMMUS |#6| League of Legends', description: 'Build video', publishedAt: new Date('2017-02-01'), duration: 600, viewCount: 400000n },
    { id: 'v5', title: 'Funny League Moments #45', description: 'Funny moments compilation', publishedAt: new Date('2020-01-01'), duration: 600, viewCount: 900000n },
];

const BOY_BOY_VIDEOS = [
    { id: 'b1', title: 'We Went To North Korea To Get A Haircut', description: 'North Korea vlog', publishedAt: new Date('2017-01-01'), duration: 600, viewCount: 15000000n },
    { id: 'b2', title: 'I Snuck Into An Arms Dealer Convention', description: 'Weapons expo', publishedAt: new Date('2023-01-01'), duration: 600, viewCount: 5000000n },
    { id: 'b3', title: 'We ruined all of Sydney\'s Uber deliveries', description: 'Social experiment', publishedAt: new Date('2022-01-01'), duration: 600, viewCount: 4000000n },
    // Inject a fake target to see if AI picks it despite low views
    { id: 'TARGET_IRAN', title: 'We visited Iran to eat Kebab', description: 'Iran travel vlog and food review', publishedAt: new Date('2024-06-01'), duration: 600, viewCount: 1000n },
];

describe('AI Topic Selection Logic', () => {
    // Increase timeout for AI API calls
    jest.setTimeout(30000);

    it('should confirm API key is present', () => {
        const key = process.env.GOOGLE_GEMINI_API_KEY;
        console.log(`Checking API Key: ${key ? "Present (" + key.substring(0, 5) + "...)" : "MISSING"}`);
        expect(key).toBeDefined();
    });

    it('should prioritize specific "Build" videos over generic "League" videos', async () => {
        const result = await selectVideosByTopic(CPT_PIANTA_VIDEOS, 'funny league build', 3);
        console.log('CptPianta Result:', result);

        const selectedIds = new Set(result.selectedVideoIds);

        // Should select the build videos (v3, v4)
        expect(selectedIds.has('v3')).toBe(true); // Rammus Lethality
        expect(selectedIds.has('v4')).toBe(true); // Rammus Thornmail

        // Should check reason contains "AI" or "Gemini" evidence if we could inspect it,
        // but seeing "reasoning" text in logs will verify it wasn't the fallback.
    });

    it('should prioritize specific "Iran" video despite low views over popular stunts', async () => {
        const result = await selectVideosByTopic(BOY_BOY_VIDEOS, 'iran related videos', 3);
        console.log('BoyBoy Result:', result);

        const selectedIds = new Set(result.selectedVideoIds); // Corrected property access

        // MUST pick the fake Iran video
        expect(selectedIds.has('TARGET_IRAN')).toBe(true);

        // Should NOT just pick the highest view count ones blindly
    });
});
