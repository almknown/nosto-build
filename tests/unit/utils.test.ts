import { parseDuration, formatDuration, formatViewCount } from "@/lib/utils";

describe("Utility Functions", () => {
    describe("parseDuration", () => {
        it("parses hours, minutes, and seconds", () => {
            expect(parseDuration("PT1H30M45S")).toBe(5445);
        });

        it("parses minutes and seconds only", () => {
            expect(parseDuration("PT10M30S")).toBe(630);
        });

        it("parses seconds only", () => {
            expect(parseDuration("PT45S")).toBe(45);
        });

        it("parses minutes only", () => {
            expect(parseDuration("PT5M")).toBe(300);
        });

        it("parses hours only", () => {
            expect(parseDuration("PT2H")).toBe(7200);
        });

        it("returns 0 for invalid format", () => {
            expect(parseDuration("invalid")).toBe(0);
            expect(parseDuration("")).toBe(0);
        });
    });

    describe("formatDuration", () => {
        it("formats seconds only", () => {
            expect(formatDuration(45)).toBe("0:45");
        });

        it("formats minutes and seconds", () => {
            expect(formatDuration(185)).toBe("3:05");
        });

        it("formats hours, minutes, and seconds", () => {
            expect(formatDuration(3665)).toBe("1:01:05");
        });
    });

    describe("formatViewCount", () => {
        it("formats millions", () => {
            expect(formatViewCount(1500000)).toBe("1.5M");
        });

        it("formats thousands", () => {
            expect(formatViewCount(25000)).toBe("25.0K");
        });

        it("keeps small numbers as-is", () => {
            expect(formatViewCount(999)).toBe("999");
        });

        it("handles string input", () => {
            expect(formatViewCount("1000000")).toBe("1.0M");
        });

        it("handles bigint input", () => {
            expect(formatViewCount(BigInt(5000))).toBe("5.0K");
        });
    });
});
