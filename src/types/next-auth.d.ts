import "next-auth";
import type { Tier } from "@prisma/client";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            tier?: Tier;
            dailyCredits?: number;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
    }
}
