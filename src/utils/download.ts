export function downloadFile(
  data: string,
  filename: string,
  format: "csv" | "json",
) {
  const blob = new Blob([data], { type: typeByFormats[format] });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const typeByFormats = {
  csv: "text/csv;charset=utf-8",
  json: "application/json;charset=utf-8",
} as const;
