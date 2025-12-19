/**
 * Strip HTML tags from a string and return plain text
 * Useful for displaying HTML content as plain text in cards/lists
 * @param {string} html - HTML string to strip
 * @returns {string} Plain text without HTML tags
 */
export function stripHtmlTags(html) {
  if (!html) return "";
  // Create a temporary element to parse HTML
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  // Get text content and normalize whitespace
  return tmp.textContent || tmp.innerText || "";
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Strip HTML tags and truncate
 * @param {string} html - HTML string
 * @param {number} maxLength - Maximum length
 * @returns {string} Plain truncated text
 */
export function stripAndTruncate(html, maxLength = 100) {
  return truncateText(stripHtmlTags(html), maxLength);
}

/**
 * Remove [[SOURCE:xxx]] and [[OWNER:xxx]] tags from description
 * These tags are used internally to track course templates and ownership
 * @param {string} text - Text that may contain SOURCE/OWNER tags
 * @returns {string} Clean text without SOURCE/OWNER tags
 */
export function removeSourceTags(text) {
  if (!text) return "";
  return text.replace(/\[\[(SOURCE|OWNER):\d+\]\]/g, "").trim();
}

/**
 * Clean HTML for display - removes SOURCE tags and optionally strips HTML
 * @param {string} html - HTML string that may contain SOURCE tags
 * @param {boolean} stripTags - Whether to strip HTML tags as well
 * @returns {string} Clean text
 */
export function cleanHtmlForDisplay(html, stripTags = false) {
  if (!html) return "";
  const cleaned = removeSourceTags(html);
  return stripTags ? stripHtmlTags(cleaned) : cleaned;
}
