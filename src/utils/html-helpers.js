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
