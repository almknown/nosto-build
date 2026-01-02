"use client";

interface NosLogoProps {
    size?: "sm" | "md" | "lg" | "xl";
    showText?: boolean;
    className?: string;
}

const sizes = {
    sm: { icon: 32, text: "text-lg" },
    md: { icon: 48, text: "text-2xl" },
    lg: { icon: 64, text: "text-4xl" },
    xl: { icon: 80, text: "text-6xl" },
};

export default function NosLogo({ size = "md", showText = true, className = "" }: NosLogoProps) {
    const { icon, text } = sizes[size];

    return (
        <div className={`nos-logo flex items-center gap-3 ${className}`}>
            {/* Logo Icon - Gradient "N" */}
            <div
                className="nos-logo-icon relative flex items-center justify-center rounded-xl"
                style={{
                    width: icon,
                    height: icon,
                    background: "linear-gradient(135deg, #10b981 0%, #6366f1 50%, #8b5cf6 100%)",
                    boxShadow: "0 8px 32px rgba(99, 102, 241, 0.4)",
                }}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ width: icon * 0.6, height: icon * 0.6 }}
                >
                    <path
                        d="M6 4v16M6 4l12 16M18 4v16"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                {/* Glow effect */}
                <div
                    className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: "linear-gradient(135deg, #10b981 0%, #6366f1 50%, #8b5cf6 100%)",
                        filter: "blur(12px)",
                        zIndex: -1,
                    }}
                />
            </div>

            {/* Logo Text */}
            {showText && (
                <span className={`font-bold ${text} gradient-text-logo`}>
                    NosBot
                </span>
            )}
        </div>
    );
}
