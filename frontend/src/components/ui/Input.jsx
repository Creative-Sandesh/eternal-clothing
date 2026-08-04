import { useState, useId } from "react";
function Input({
  label,
  error,
  hint,
  placeholder,
  type = "text",
  value,
  onChange,
  disabled = false,
  required = false,
  className = "",
  ...rest
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const hasValue = value !== void 0 ? String(value).length > 0 : false;
  const isFloating = focused || hasValue;
  return <div className={["relative w-full", className].join(" ")}>
      <div className="relative">
        {label && <label
    htmlFor={id}
    className={[
      "absolute left-0 font-sans transition-all duration-200 ease-in-out pointer-events-none select-none",
      isFloating ? "top-0 text-[10px] tracking-widest uppercase text-[#8c8277]" : "top-3.5 text-sm text-[#8c8277]",
      error ? "text-[#7a1a1a]" : "",
      focused && !error ? "text-[#0a0a0a]" : ""
    ].filter(Boolean).join(" ")}
  >
            {label}
            {required && <span className="ml-0.5 text-[#7a1a1a]">*</span>}
          </label>}
        <input
    id={id}
    type={type}
    value={value}
    placeholder={!label || isFloating ? placeholder : void 0}
    disabled={disabled}
    required={required}
    onFocus={() => setFocused(true)}
    onBlur={() => setFocused(false)}
    onChange={(e) => onChange?.(e.target.value)}
    aria-invalid={!!error}
    aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : void 0}
    className={[
      "w-full bg-transparent font-sans text-sm text-[#0a0a0a]",
      "border-0 border-b pb-2 outline-none",
      label ? "pt-5" : "pt-2",
      "placeholder:text-[#8c8277]/60",
      "transition-all duration-200",
      error ? "border-[#7a1a1a] focus:border-[#7a1a1a]" : "border-[#e0d9cc] focus:border-[#0a0a0a]",
      disabled ? "opacity-40 cursor-not-allowed" : ""
    ].filter(Boolean).join(" ")}
    {...rest}
  />
      </div>

      {(error || hint) && <p
    id={error ? `${id}-error` : `${id}-hint`}
    className={[
      "mt-1.5 text-[11px] font-sans",
      error ? "text-[#7a1a1a]" : "text-[#8c8277]"
    ].join(" ")}
  >
          {error || hint}
        </p>}
    </div>;
}
export {
  Input as default
};
