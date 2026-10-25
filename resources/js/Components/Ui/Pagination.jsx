import { Link } from '@inertiajs/react';

export default function Pagination({ paginator, className = '' }) {
    if (!paginator || !paginator.links || paginator.last_page <= 1) {
        return null;
    }

    const pages = paginator.links.filter(
        (link) => !link.label.includes('&laquo;') && !link.label.includes('&raquo;'),
    );

    return (
        <nav
            className={`flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:px-6 ${className}`}
            aria-label="Pagination"
        >
            <p className="text-sm text-gray-500">
                Showing{' '}
                <span className="font-medium text-gray-700">
                    {paginator.from ?? 0}–{paginator.to ?? 0}
                </span>{' '}
                of <span className="font-medium text-gray-700">{paginator.total}</span>
            </p>

            <div className="flex flex-wrap items-center gap-1">
                {pages.map((link, index) =>
                    link.url ? (
                        <Link
                            key={`${link.label}-${index}`}
                            href={link.url}
                            preserveScroll
                            className={`inline-flex min-w-9 items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition ${
                                link.active
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            aria-current={link.active ? 'page' : undefined}
                        >
                            {link.label}
                        </Link>
                    ) : (
                        <span
                            key={`${link.label}-${index}`}
                            className="inline-flex min-w-9 items-center justify-center rounded-md px-3 py-1.5 text-sm text-gray-400"
                        >
                            {link.label}
                        </span>
                    ),
                )}
            </div>
        </nav>
    );
}
