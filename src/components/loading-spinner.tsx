interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

export default function LoadingSpinner({
    size = 'md',
    message
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4',
    };

    const spinnerSize = sizeClasses[size];

    return (
        <div className="flex flex-col items-center justify-center gap-4 animate-fadeIn">
            <div
                className={`${spinnerSize} border-border border-t-primary-start rounded-full animate-spin`}
                role="status"
                aria-label="Loading"
            />
            {message && (
                <p className="text-foreground-muted text-sm animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
}
