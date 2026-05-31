export const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

// Broad international phone regex (captures country code, spaces, dashes, parentheses)
export const PHONE_REGEX = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g;

// Experience regex: captures numbers like '3', '3.5', '4 yrs', '5 years', '4+ years'
export const EXPERIENCE_REGEX = /(\d+(?:\.\d+)?)(?:\+)?\s*(?:years?|yrs?|y)/i;

export function extractEmails(text: string): string[] {
	if (!text) return [];
	const matches = text.match(EMAIL_REGEX) || [];
	// Normalize to lower-case and unique
	return Array.from(new Set(matches.map((m) => m.toLowerCase())));
}

export function extractPhones(text: string): string[] {
	if (!text) return [];
	const matches = text.match(PHONE_REGEX) || [];
	// Simple normalize: collapse spaces/dashes and trim
	const normalized = matches
		.map((m) => m.replace(/[\s-()+\.]/g, ''))
		.filter(Boolean);
	return Array.from(new Set(normalized));
}

export function extractExperience(text: string): number | null {
	if (!text) return null;
	const m = text.match(EXPERIENCE_REGEX);
	if (!m) return null;
	const val = parseFloat(m[1]);
	return isNaN(val) ? null : val;
}

export default { EMAIL_REGEX, PHONE_REGEX, EXPERIENCE_REGEX, extractEmails, extractPhones, extractExperience };
