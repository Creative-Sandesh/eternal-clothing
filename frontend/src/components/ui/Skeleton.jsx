function Shimmer({ className = "" }) {
  return <div
    className={[
      "relative overflow-hidden bg-[#e0d9cc]",
      "before:absolute before:inset-0",
      "before:bg-gradient-to-r before:from-transparent before:via-[#fafafa]/40 before:to-transparent",
      "before:animate-[shimmer_1.5s_infinite]",
      className
    ].join(" ")}
    aria-hidden="true"
  />;
}
function TextSkeleton({ lines = 3 }) {
  const widths = ["w-full", "w-5/6", "w-3/4", "w-4/5", "w-2/3"];
  return <div className="flex flex-col gap-2.5">
      {Array.from({ length: lines }, (_, i) => <Shimmer key={i} className={["h-3.5", widths[i % widths.length]].join(" ")} />)}
    </div>;
}
function CardSkeleton() {
  return <div className="flex flex-col gap-4 p-6 border border-[#e0d9cc]">
      <Shimmer className="h-40 w-full" />
      <div className="flex flex-col gap-2">
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-3 w-1/2" />
      </div>
      <Shimmer className="h-9 w-full" />
    </div>;
}
function ProductCardSkeleton() {
  return <div className="flex flex-col gap-3">
      <Shimmer className="w-full aspect-[3/4]" />
      <div className="flex flex-col gap-2 px-1">
        <Shimmer className="h-3 w-1/3" />
        <Shimmer className="h-4 w-2/3" />
        <Shimmer className="h-3 w-1/4" />
      </div>
    </div>;
}
function AvatarSkeleton() {
  return <div className="flex items-center gap-3">
      <Shimmer className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1">
        <Shimmer className="h-3 w-1/3" />
        <Shimmer className="h-3 w-1/2" />
      </div>
    </div>;
}
function TableRowSkeleton() {
  return <div className="flex items-center gap-4 py-3 border-b border-[#e0d9cc]">
      <Shimmer className="h-3 w-6 shrink-0" />
      <Shimmer className="h-8 w-8 shrink-0" />
      <Shimmer className="h-3 flex-1" />
      <Shimmer className="h-3 w-16 shrink-0" />
      <Shimmer className="h-3 w-12 shrink-0" />
    </div>;
}
function Skeleton({
  variant = "text",
  className = "",
  lines = 3
}) {
  return <div className={className} aria-busy="true" aria-label="Loading...">
      {variant === "text" && <TextSkeleton lines={lines} />}
      {variant === "card" && <CardSkeleton />}
      {variant === "product-card" && <ProductCardSkeleton />}
      {variant === "avatar" && <AvatarSkeleton />}
      {variant === "table-row" && <TableRowSkeleton />}
    </div>;
}
export {
  Skeleton as default
};
