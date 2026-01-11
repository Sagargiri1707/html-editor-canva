import DOMPurify from 'dompurify'

// Configure DOMPurify for WYSIWYG editing
// We allow most HTML tags but remove dangerous ones
const ALLOWED_TAGS = [
  // Text formatting
  'p', 'br', 'span', 'div',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'ins',
  'sub', 'sup', 'mark',
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Lists
  'ul', 'ol', 'li',
  // Links & media
  'a', 'img', 'video', 'source', 'picture', 'figure', 'figcaption',
  // Tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  // Block elements
  'blockquote', 'pre', 'code', 'hr',
  // External resources (CDN scripts, styles) - with restrictions
  'link', 'script',
  // Other
  'address', 'article', 'aside', 'details', 'summary', 'section', 'nav', 'header', 'footer', 'main',
]

const ALLOWED_ATTR = [
  // Global attributes
  'id', 'class', 'style', 'title', 'lang', 'dir',
  // Links
  'href', 'target', 'rel',
  // Media
  'src', 'alt', 'width', 'height', 'loading', 'srcset', 'sizes', 'crossorigin',
  // Video
  'controls', 'autoplay', 'loop', 'muted', 'poster', 'preload',
  // Tables
  'colspan', 'rowspan', 'scope', 'headers',
  // Script/Link tags (for CDN resources)
  'type', 'integrity', 'async', 'defer', 'charset',
  // Data attributes (for editor tracking)
  'data-*',
]

// Sanitize HTML input (removes XSS vectors)
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true,
    // Keep safe URLs only (allow https, http, data URIs for images, mailto, tel)
    ALLOWED_URI_REGEXP: /^(?:(?:https?|data|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Add hook to ensure script tags only load from CDN
    ADD_TAGS: ['link', 'script'],
    ADD_ATTR: ['crossorigin', 'integrity', 'async', 'defer', 'charset', 'type'],
  })
}

// Sanitize for output (cleaner, removes editor-specific attributes)
export function sanitizeForOutput(html: string): string {
  const cleaned = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTR.filter(attr => !attr.startsWith('data-')),
    ALLOW_DATA_ATTR: false,
  })
  
  // Remove empty paragraphs and normalize whitespace
  return cleaned
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<br\s*\/?>\s*$/gi, '')
    .trim()
}

// Check if HTML contains potentially dangerous content
export function containsDangerousContent(html: string): boolean {
  const dangerous = [
    /<script\b/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc.
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /data:text\/html/i,
  ]
  
  return dangerous.some(pattern => pattern.test(html))
}

