import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string) {
  if (!html) return '';
  try {
    return DOMPurify.sanitize(html);
  } catch (e) {
    console.error('Sanitization failed', e);
    return html;
  }
}

export default sanitizeHtml;
