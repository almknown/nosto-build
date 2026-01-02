import { prisma } from "./prisma";

const FREE_DAILY_CREDITS = 3;
const PRO_DAILY_CREDITS = 100;

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
}

/**
 * Check and consume rate limit for a user
 * Resets daily at midnight UTC
 */
export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true, dailyCredits: true, lastCreditReset: true },
    });

    if (!user) {
        return { allowed: false, remaining: 0, resetAt: new Date() };
    }

    const now = new Date();
    const lastReset = user.lastCreditReset;
    const todayMidnight = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

    // Check if we need to reset credits
    if (lastReset < todayMidnight) {
        const maxCredits = user.tier === "PRO" ? PRO_DAILY_CREDITS : FREE_DAILY_CREDITS;
        await prisma.user.update({
            where: { id: userId },
            data: {
                dailyCredits: maxCredits,
                lastCreditReset: now,
            },
        });

        return {
            allowed: true,
            remaining: maxCredits - 1,
            resetAt: new Date(todayMidnight.getTime() + 24 * 60 * 60 * 1000),
        };
    }

    // Check if user has credits
    if (user.dailyCredits <= 0) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: new Date(todayMidnight.getTime() + 24 * 60 * 60 * 1000),
        };
    }

    // Consume a credit
    await prisma.user.update({
        where: { id: userId },
        data: { dailyCredits: { decrement: 1 } },
    });

    return {
        allowed: true,
        remaining: user.dailyCredits - 1,
        resetAt: new Date(todayMidnight.getTime() + 24 * 60 * 60 * 1000),
    };
}
