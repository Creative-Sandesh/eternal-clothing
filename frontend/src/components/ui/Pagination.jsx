import { RiArrowLeftLine, RiArrowRightLine } from "react-icons/ri";
function getPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
function Pagination({
  currentPage,
  totalPages,
  onPageChange
}) {
  if (totalPages <= 1) return null;
  const pages = getPages(currentPage, totalPages);
  return <nav
    className="flex items-center justify-center gap-1"
    aria-label="Pagination"
  >
      {
    /* Prev */
  }
      <button
    onClick={() => onPageChange(currentPage - 1)}
    disabled={currentPage === 1}
    aria-label="Previous page"
    className={[
      "flex items-center justify-center w-9 h-9 border transition-all duration-200",
      "font-sans text-xs",
      currentPage === 1 ? "border-[#e0d9cc] text-[#e0d9cc] cursor-not-allowed" : "border-[#e0d9cc] text-[#0a0a0a] hover:border-[#0a0a0a]"
    ].join(" ")}
  >
        <RiArrowLeftLine size={14} />
      </button>

      {pages.map(
    (page, i) => page === "..." ? <span
      key={`ellipsis-${i}`}
      className="w-9 h-9 flex items-center justify-center font-sans text-xs text-[#8c8277]"
      aria-hidden="true"
    >
            &hellip;
          </span> : <button
      key={page}
      onClick={() => onPageChange(page)}
      aria-current={currentPage === page ? "page" : void 0}
      aria-label={`Page ${page}`}
      className={[
        "flex items-center justify-center w-9 h-9 border transition-all duration-200",
        "font-sans text-xs tracking-wide",
        currentPage === page ? "bg-[#0a0a0a] border-[#0a0a0a] text-[#fafafa]" : "border-[#e0d9cc] text-[#0a0a0a] hover:border-[#0a0a0a]"
      ].join(" ")}
    >
            {page}
          </button>
  )}

      {
    /* Next */
  }
      <button
    onClick={() => onPageChange(currentPage + 1)}
    disabled={currentPage === totalPages}
    aria-label="Next page"
    className={[
      "flex items-center justify-center w-9 h-9 border transition-all duration-200",
      "font-sans text-xs",
      currentPage === totalPages ? "border-[#e0d9cc] text-[#e0d9cc] cursor-not-allowed" : "border-[#e0d9cc] text-[#0a0a0a] hover:border-[#0a0a0a]"
    ].join(" ")}
  >
        <RiArrowRightLine size={14} />
      </button>
    </nav>;
}
export {
  Pagination as default
};
