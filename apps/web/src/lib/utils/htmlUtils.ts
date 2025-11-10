/**
 * HTML Utilities
 * Safely decode and render HTML content from database
 */

/**
 * Decode HTML entities
 * Converts &lt; to <, &gt; to >, &amp; to &, etc.
 */
export function decodeHTMLEntities(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use manual replacement
    return html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&apos;/g, "'");
  }

  // Client-side: use DOM parser (more reliable)
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
}

/**
 * Sanitize HTML for safe rendering
 * Removes potentially dangerous tags while keeping formatting
 */
export function sanitizeJobDescription(html: string): string {
  if (!html) return '';

  // First, decode any HTML entities
  let decoded = decodeHTMLEntities(html);

  // Remove script tags and their content
  decoded = decoded.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  decoded = decoded.replace(/\son\w+="[^"]*"/gi, '');
  decoded = decoded.replace(/\son\w+='[^']*'/gi, '');

  // Remove javascript: URLs
  decoded = decoded.replace(/href="javascript:[^"]*"/gi, 'href="#"');
  decoded = decoded.replace(/href='javascript:[^']*'/gi, "href='#'");

  // Remove iframe tags
  decoded = decoded.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove style tags
  decoded = decoded.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  return decoded;
}

/**
 * Prepare job description HTML for safe rendering
 * This is the main function to use in components
 */
export function prepareJobDescriptionHTML(description: string | null | undefined): string {
  if (!description) {
    return '<p>No description available.</p>';
  }

  return sanitizeJobDescription(description);
}
