/** Strip HTML tags from user/CMS strings for safe text display */
export function sanitizeText(input) {
  if (input == null) return "";
  const s = String(input);
  const doc = typeof document !== "undefined" ? new DOMParser().parseFromString(s, "text/html") : null;
  return doc ? doc.body.textContent || "" : s.replace(/<[^>]*>/g, "");
}
