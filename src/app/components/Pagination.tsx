import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  limitOptions?: number[];
}

export function Pagination({
  currentPage,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [12, 24, 48, 100],
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div
      className="px-4 py-4 border-t space-y-4"
      style={{
        backgroundColor: "var(--ws-card)",
        borderColor: "var(--ws-border)",
      }}
    >
      {/* Info Section */}
      <div
        className="flex items-center justify-between text-sm"
        style={{ color: "var(--ws-text-secondary)" }}
      >
        <div>
          Total Items: <strong>{total}</strong>
        </div>
        <div>
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex items-center justify-between gap-4">
        {/* Limit Selector */}
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="px-3 py-2 rounded text-sm border outline-none"
          style={{
            backgroundColor: "var(--ws-surface)",
            borderColor: "var(--ws-border)",
            color: "var(--ws-text-primary)",
          }}
        >
          {limitOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt} per page
            </option>
          ))}
        </select>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrev}
            className="px-3 py-2 rounded text-sm font-medium transition-all flex items-center gap-2"
            style={{
              backgroundColor: canGoPrev
                ? "var(--ws-button-bg)"
                : "var(--ws-surface)",
              color: canGoPrev
                ? "var(--ws-button-text)"
                : "var(--ws-text-muted)",
              cursor: canGoPrev ? "pointer" : "not-allowed",
              opacity: canGoPrev ? 1 : 0.5,
            }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            className="px-3 py-2 rounded text-sm font-medium transition-all flex items-center gap-2"
            style={{
              backgroundColor: canGoNext
                ? "var(--ws-button-bg)"
                : "var(--ws-surface)",
              color: canGoNext
                ? "var(--ws-button-text)"
                : "var(--ws-text-muted)",
              cursor: canGoNext ? "pointer" : "not-allowed",
              opacity: canGoNext ? 1 : 0.5,
            }}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
