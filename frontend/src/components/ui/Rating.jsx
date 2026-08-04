import { useState, useId } from "react";
const sizeMap = {
  sm: { star: 12, text: "text-[10px]" },
  md: { star: 16, text: "text-xs" },
  lg: { star: 20, text: "text-sm" }
};
function Star({
  fill,
  size,
  id
}) {
  const clipId = `star-clip-${id}`;
  return <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="shrink-0"
  >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={24 * fill} height="24" />
        </clipPath>
      </defs>
      {
    /* empty star */
  }
      <path
    d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
    fill="#e0d9cc"
  />
      {
    /* filled portion */
  }
      <path
    d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
    fill="#0a0a0a"
    clipPath={`url(#${clipId})`}
  />
    </svg>;
}
function Rating({
  value,
  count,
  size = "md",
  interactive = false,
  onChange
}) {
  const [hovered, setHovered] = useState(null);
  const uid = useId().replace(/:/g, "");
  const { star, text } = sizeMap[size];
  const display = hovered !== null ? hovered : value;
  return <div className="inline-flex items-center gap-1.5">
      <div
    className="flex items-center gap-0.5"
    role={interactive ? "radiogroup" : "img"}
    aria-label={`Rating: ${value} out of 5${count !== void 0 ? `, ${count} reviews` : ""}`}
  >
        {Array.from({ length: 5 }, (_, i) => {
    const starIndex = i + 1;
    const fill = Math.min(1, Math.max(0, display - i));
    return <span
      key={i}
      role={interactive ? "radio" : void 0}
      aria-checked={interactive ? starIndex === Math.round(value) : void 0}
      tabIndex={interactive ? 0 : void 0}
      className={interactive ? "cursor-pointer focus:outline-none" : ""}
      onMouseEnter={interactive ? () => setHovered(starIndex) : void 0}
      onMouseLeave={interactive ? () => setHovered(null) : void 0}
      onClick={interactive ? () => onChange?.(starIndex) : void 0}
      onKeyDown={interactive ? (e) => {
        if (e.key === "Enter" || e.key === " ") onChange?.(starIndex);
      } : void 0}
    >
              <Star fill={fill} size={star} id={`${uid}-${i}`} />
            </span>;
  })}
      </div>
      {count !== void 0 && <span className={["font-sans text-[#8c8277]", text].join(" ")}>
          ({count.toLocaleString()})
        </span>}
    </div>;
}
export {
  Rating as default
};
