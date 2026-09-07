// Build a CSV string from an array of plain objects and trigger a download.
// Columns are taken from `columns` ([{ key, label }]) so the header row and
// ordering are explicit.
function toCsvValue(v) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCsv(filename, columns, rows) {
  const header = columns.map((c) => toCsvValue(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => toCsvValue(c.format ? c.format(row) : row[c.key])).join(","))
    .join("\n");
  const csv = `${header}\n${body}\n`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
