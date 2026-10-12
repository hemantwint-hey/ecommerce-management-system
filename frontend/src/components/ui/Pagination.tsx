interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ pageNumber, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i).filter(
    (page) => page === 0 || page === totalPages - 1 || Math.abs(page - pageNumber) <= 1,
  );

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-4" aria-label="Pagination">
      <button
        onClick={() => onPageChange(pageNumber - 1)}
        disabled={pageNumber === 0}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-ink-faint disabled:hover:bg-transparent"
        aria-label="Previous page"
      >
        ‹
      </button>
      {pages.map((page, index) => {
        const previous = pages[index - 1];
        const showGap = previous !== undefined && page - previous > 1;
        return (
          <span key={page} className="flex items-center gap-1.5">
            {showGap && <span className="px-1 text-ink-faint">…</span>}
            <button
              onClick={() => onPageChange(page)}
              aria-current={page === pageNumber ? 'page' : undefined}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                page === pageNumber ? 'bg-ink text-white' : 'text-ink hover:bg-surface-muted'
              }`}
            >
              {page + 1}
            </button>
          </span>
        );
      })}
      <button
        onClick={() => onPageChange(pageNumber + 1)}
        disabled={pageNumber >= totalPages - 1}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-ink-faint disabled:hover:bg-transparent"
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}
