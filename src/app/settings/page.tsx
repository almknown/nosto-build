"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NosLogo from "@/components/nosbot-logo";

interface UserPreferences {
    theme: "dark" | "light";
    defaultVideoCount: number;
    excludeShortsByDefault: boolean;
}

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Local preferences (stored in localStorage for now)
    const [preferences, setPreferences] = useState<UserPreferences>({
        theme: "dark",
        defaultVideoCount: 10,
        excludeShortsByDefault: true,
    });
    const [saved, setSaved] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Load preferences from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("nosbot-preferences");
        if (stored) {
            try {
                setPreferences(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse preferences", e);
            }
        }
    }, []);

    // Save preferences to localStorage
    const savePreferences = () => {
        localStorage.setItem("nosbot-preferences", JSON.stringify(preferences));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleThemeChange = (theme: "dark" | "light") => {
        setPreferences((prev) => ({ ...prev, theme }));
        // For now, theme toggle is visual only - actual implementation would require ThemeProvider
        document.documentElement.setAttribute("data-theme", theme);
    };

    if (status === "loading") {
        return (
            <main className="min-h-screen py-12 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
                        style={{ borderColor: "var(--primary-start)", borderTopColor: "transparent" }}
                    />
                    <p className="mt-4" style={{ color: "var(--foreground-muted)" }}>
                        Loading settings...
                    </p>
                </div>
            </main>
        );
    }

    if (!session) {
        return null; // Will redirect
    }

    return (
        <main className="min-h-screen py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/account"
                        className="inline-flex items-center gap-2 text-sm mb-4 hover:underline"
                        style={{ color: "var(--foreground-muted)" }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Account
                    </Link>
                    <h1 className="text-3xl font-bold gradient-text-logo">Settings</h1>
                    <p className="mt-2" style={{ color: "var(--foreground-muted)" }}>
                        Customize your NosBot experience
                    </p>
                </div>

                {/* Appearance Section */}
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-xl">🎨</span>
                        Appearance
                    </h2>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Theme</p>
                            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                                Choose your preferred color scheme
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleThemeChange("dark")}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${preferences.theme === "dark" ? "ring-2 ring-[var(--primary-start)]" : ""
                                    }`}
                                style={{
                                    background: preferences.theme === "dark"
                                        ? "linear-gradient(135deg, var(--primary-start), var(--primary-end))"
                                        : "var(--background-hover)",
                                }}
                            >
                                🌙 Dark
                            </button>
                            <button
                                onClick={() => handleThemeChange("light")}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${preferences.theme === "light" ? "ring-2 ring-[var(--primary-start)]" : ""
                                    }`}
                                style={{
                                    background: preferences.theme === "light"
                                        ? "linear-gradient(135deg, var(--primary-start), var(--primary-end))"
                                        : "var(--background-hover)",
                                }}
                            >
                                ☀️ Light
                            </button>
                        </div>
                    </div>
                </div>

                {/* Defaults Section */}
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-xl">⚙️</span>
                        Default Preferences
                    </h2>

                    <div className="space-y-6">
                        {/* Default Video Count */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Default Video Count</p>
                                <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                                    Number of videos in new playlists
                                </p>
                            </div>
                            <select
                                value={preferences.defaultVideoCount}
                                onChange={(e) =>
                                    setPreferences((prev) => ({
                                        ...prev,
                                        defaultVideoCount: parseInt(e.target.value),
                                    }))
                                }
                                className="input w-24 text-center"
                            >
                                {[5, 10, 15, 20].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Exclude Shorts */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Exclude Shorts by Default</p>
                                <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                                    Skip YouTube Shorts when generating
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.excludeShortsByDefault}
                                    onChange={(e) =>
                                        setPreferences((prev) => ({
                                            ...prev,
                                            excludeShortsByDefault: e.target.checked,
                                        }))
                                    }
                                    className="sr-only peer"
                                />
                                <div
                                    className="w-11 h-6 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                    style={{
                                        background: preferences.excludeShortsByDefault
                                            ? "linear-gradient(135deg, var(--primary-start), var(--primary-end))"
                                            : "var(--background-hover)",
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={savePreferences}
                        className="mt-6 w-full py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                        style={{
                            background: "linear-gradient(135deg, var(--primary-start), var(--primary-end))",
                            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
                        }}
                    >
                        {saved ? "✓ Saved!" : "Save Preferences"}
                    </button>
                </div>

                {/* Data & Privacy Section */}
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-xl">🔒</span>
                        Data & Privacy
                    </h2>

                    <div className="space-y-4">
                        <button
                            className="w-full py-3 px-4 rounded-xl font-medium text-left flex items-center justify-between hover:bg-[var(--background-hover)] transition-colors"
                            style={{ border: "1px solid var(--border)" }}
                            onClick={() => {
                                // Placeholder for export functionality
                                alert("Export feature coming soon!");
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export My Data
                            </div>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <button
                            className="w-full py-3 px-4 rounded-xl font-medium text-left flex items-center justify-between hover:bg-red-500/10 transition-colors"
                            style={{ border: "1px solid rgba(239, 68, 68, 0.3)", color: "var(--error)" }}
                            onClick={() => {
                                if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                                    alert("Account deletion coming soon!");
                                }
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Account
                            </div>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* About Section */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-xl">ℹ️</span>
                        About
                    </h2>

                    <div className="flex items-center justify-between">
                        <NosLogo size="sm" />
                        <div className="text-right">
                            <p className="font-medium">NosBot</p>
                            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                                Version 1.0.0
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 text-sm text-center" style={{ color: "var(--foreground-muted)" }}>
                        Made with ❤️ for YouTube nostalgia lovers
                    </p>
                </div>
            </div>
        </main>
    );
}
