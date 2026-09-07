const SYMBOLS = { USD: "$", GBP: "£", EUR: "€", NPR: "रू", INR: "₹", AUD: "A$", CAD: "C$" };

// Module-level current currency, kept in sync by SettingsContext so non-React
// code (e.g. one-off formatting) can still format correctly. Defaults to the
// store's seeded currency to avoid a symbol flash before settings load.
let _currency = "NPR";

export const setCurrentCurrency = (code) => {
  if (code) _currency = String(code).toUpperCase();
};

export const currencySymbol = (currency = _currency) =>
  SYMBOLS[String(currency || "USD").toUpperCase()] || `${String(currency).toUpperCase()} `;

export function formatMoney(amount, currency = _currency) {
  // Accept numbers, numeric strings, and already-grouped strings ("1,234.5").
  const n = typeof amount === "string" ? Number(amount.replace(/,/g, "")) : Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  const body = safe.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${currencySymbol(currency)}${body}`;
}
