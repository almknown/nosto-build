import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    start: "#8b5cf6",
                    end: "#ec4899",
                    hover: "#7c3aed",
                },
                background: {
                    DEFAULT: "#0f0f1a",
                    card: "#1a1a2e",
                    hover: "#252540",
                },
                foreground: {
                    DEFAULT: "#f8fafc",
                    muted: "#94a3b8",
                },
                border: "#2d2d44",
            },
            backgroundImage: {
                "gradient-primary": "linear-gradient(135deg, #8b5cf6, #ec4899)",
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            },
            boxShadow: {
                sm: "0 1px 2px rgba(0, 0, 0, 0.2)",
                md: "0 4px 6px rgba(0, 0, 0, 0.3)",
                lg: "0 10px 15px rgba(0, 0, 0, 0.4)",
                xl: "0 20px 25px rgba(0, 0, 0, 0.5)",
                glow: "0 0 20px rgba(139, 92, 246, 0.5)",
                "glow-lg": "0 0 30px rgba(236, 72, 153, 0.7)",
            },
            animation: {
                float: "float 3s ease-in-out infinite",
                "pulse-glow": "pulse-glow 2s ease-in-out infinite",
                fadeIn: "fadeIn 0.5s ease-out",
                shimmer: "shimmer 2s infinite",
                loading: "loading 1.5s ease-in-out infinite",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                "pulse-glow": {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)" },
                    "50%": { boxShadow: "0 0 30px rgba(236, 72, 153, 0.7)" },
                },
                fadeIn: {
                    from: { opacity: "0", transform: "translateY(20px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                shimmer: {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                },
                loading: {
                    "0%": { backgroundPosition: "200% 0" },
                    "100%": { backgroundPosition: "-200% 0" },
                },
            },
            transitionDuration: {
                fast: "150ms",
                base: "200ms",
                slow: "300ms",
            },
        },
    },
    plugins: [],
};

export default config;
