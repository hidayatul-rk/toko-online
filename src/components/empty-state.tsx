import Link from "next/link";

type Props = {
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
};

export function EmptyState({
    title,
    description,
    actionLabel,
    actionHref,
}: Props) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="mb-2 rounded-full bg-black/5 p-6 dark:bg-white/10">
                <svg
                    className="h-10 w-10 text-black/20 dark:text-white/20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                </svg>
            </div>
            <p className="text-lg font-medium">{title}</p>
            {description && (
                <p className="text-sm text-black/60 dark:text-white/60">
                    {description}
                </p>
            )}
            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="mt-2 rounded-md bg-black px-5 py-2 text-sm text-white dark:bg-white dark:text-black"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
