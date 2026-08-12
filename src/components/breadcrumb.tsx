import Link from "next/link";

type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
    return (
        <nav className="mb-4 flex items-center gap-1 text-sm text-black/50 dark:text-white/50">
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                    {i > 0 && <span>/</span>}
                    {item.href ? (
                        <Link href={item.href} className="hover:text-black dark:hover:text-white">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-black dark:text-white">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
