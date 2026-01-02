"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component for graceful error handling
 * Catches JavaScript errors anywhere in the child component tree
 */
export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="glass-card p-8 max-w-lg mx-auto my-8 text-center">
                    <div className="text-5xl mb-4">😵</div>
                    <h2 className="text-xl font-semibold mb-2">
                        Something went wrong
                    </h2>
                    <p
                        className="mb-4"
                        style={{ color: "var(--foreground-muted)" }}
                    >
                        {this.state.error?.message || "An unexpected error occurred"}
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="btn-primary"
                    >
                        Try Again
                    </button>

                    {process.env.NODE_ENV === "development" && this.state.errorInfo && (
                        <details className="mt-6 text-left">
                            <summary
                                className="cursor-pointer text-sm"
                                style={{ color: "var(--foreground-muted)" }}
                            >
                                Error Details (Development Only)
                            </summary>
                            <pre
                                className="mt-2 p-4 rounded-lg text-xs overflow-auto"
                                style={{
                                    background: "var(--background)",
                                    color: "var(--error)",
                                }}
                            >
                                {this.state.error?.stack}
                                {"\n\nComponent Stack:\n"}
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Inline error display component for non-fatal errors
 */
export function InlineError({
    message,
    onRetry,
}: {
    message: string;
    onRetry?: () => void;
}) {
    return (
        <div
            className="p-4 rounded-lg flex items-center gap-3"
            style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid var(--error)",
            }}
        >
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
                <p style={{ color: "var(--error)" }}>{message}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="btn-secondary text-sm px-3 py-1"
                >
                    Retry
                </button>
            )}
        </div>
    );
}
