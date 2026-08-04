import { Link } from "react-router-dom";
function Breadcrumb({ items, className = "" }) {
  return <nav
    aria-label="Breadcrumb"
    className={["flex items-center flex-wrap", className].join(" ")}
  >
      <ol className="flex items-center flex-wrap gap-0">
        {items.map((item, i) => {
    const isLast = i === items.length - 1;
    return <li key={i} className="flex items-center">
              {i > 0 && <span
      className="mx-2.5 font-sans text-xs text-[#c9b99a] select-none"
      aria-hidden="true"
    >
                  /
                </span>}
              {isLast || !item.href ? <span
      className={[
        "font-sans text-xs tracking-wide",
        isLast ? "text-[#0a0a0a] font-medium" : "text-[#8c8277]"
      ].join(" ")}
      aria-current={isLast ? "page" : void 0}
    >
                  {item.label}
                </span> : <Link
      to={item.href}
      className="font-sans text-xs tracking-wide text-[#8c8277] hover:text-[#0a0a0a] transition-colors duration-200"
    >
                  {item.label}
                </Link>}
            </li>;
  })}
      </ol>
    </nav>;
}
export {
  Breadcrumb as default
};
