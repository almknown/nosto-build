"use client";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    message?: string;
}

const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
};

export default function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={`${sizeClasses[size]} rounded-full animate-spin`}
                style={{
                    borderColor: "var(--border)",
                    borderTopColor: "var(--primary-start)",
                }}
            />
            {message && (
                <p
                    className="text-sm animate-pulse"
                    style={{ color: "var(--foreground-muted)" }}
                >
                    {message}
                </p>
            )}
        </div>
    );
}

/**
 * A full-page loading state with centered spinner
 */
export function FullPageLoader({ message = "Loading..." }: { message?: string }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="glass-card p-8 flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" />
                <p style={{ color: "var(--foreground-muted)" }}>{message}</p>
            </div>
        </div>
    );
}

/**
 * Inline loading state for buttons or small areas
 */
export function InlineLoader({ size = "sm" }: { size?: "sm" | "md" }) {
    return (
        <span className="inline-flex items-center gap-2">
            <LoadingSpinner size={size} />
        </span>
    );
}
