import Button from "./Button";
function EmptyState({
  icon,
  title,
  description,
  action,
  className = ""
}) {
  return <div
    className={[
      "flex flex-col items-center justify-center text-center py-20 px-6",
      className
    ].join(" ")}
  >
      {icon && <div className="mb-6 text-[#e0d9cc] [&>svg]:w-12 [&>svg]:h-12 [&>*]:text-[#e0d9cc]">
          {icon}
        </div>}

      <h3 className="font-display text-2xl text-[#0a0a0a] mb-3">{title}</h3>

      {description && <p className="font-sans text-sm text-[#8c8277] max-w-xs leading-relaxed mb-8">
          {description}
        </p>}

      {action && <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>}
    </div>;
}
export {
  EmptyState as default
};
