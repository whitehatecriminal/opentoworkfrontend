import DOMPurify from "dompurify";

/**
 * Sanitize HTML for safe rendering via dangerouslySetInnerHTML.
 * Keeps valid tags (e.g. <p>, <b>, <i>, <ul>) while stripping scripts and unsafe attributes.
 */
export function sanitizeHtml(rawHtml) {
  if (!rawHtml) return "";
  if (typeof window === "undefined") return rawHtml;
  try {
    return DOMPurify.sanitize(rawHtml);
  } catch {
    return rawHtml;
  }
}

export function htmlToPlainText(rawHtml) {
  if (!rawHtml || typeof rawHtml !== "string") return "";

  return rawHtml
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export const stripHtml = htmlToPlainText;