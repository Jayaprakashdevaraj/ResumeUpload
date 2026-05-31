import { EMAIL_REGEX, PHONE_REGEX, EXPERIENCE_REGEX } from '../utils/regex';
import { SKILLS } from '../config/skills';

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  skills: string[];
  company?: string;
  role?: string;
  education?: string;
  totalExperience?: number;
}

export class AlgorithmResumeParser {
  parseResume(rawText: string): ParsedResume {
    const out: ParsedResume = { skills: [] };

    if (!rawText) return out;

    const text = rawText.replace(/\r\n/g, '\n');
    const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);

    // Name heuristic: first line if it contains letters and is short
    if (lines.length > 0) {
      const first = lines[0];
      if (first.split(' ').length <= 5 && /[A-Za-z]/.test(first)) {
        out.name = first;
      }
    }

    // Email
    const emailMatch = rawText.match(EMAIL_REGEX);
    if (emailMatch) out.email = emailMatch[0];

    // Phone
    const phoneMatch = rawText.match(PHONE_REGEX);
    if (phoneMatch) out.phone = phoneMatch[0];

    // Experience (years)
    const expMatch = rawText.match(EXPERIENCE_REGEX);
    if (expMatch) out.totalExperience = parseFloat(expMatch[1]);

    // Skills detection using SKILLS list
    const lowered = rawText.toLowerCase();
    const matched = SKILLS.filter(s => lowered.includes(s.toLowerCase()));
    out.skills = Array.from(new Set(matched));

    // Role detection: look for common role keywords in lines
    const roleKeywords = ['engineer', 'developer', 'manager', 'qa', 'architect', 'consultant', 'analyst', 'intern'];
    for (const l of lines) {
      const low = l.toLowerCase();
      for (const rk of roleKeywords) {
        if (low.includes(rk) && (!out.role || rk.length > (out.role || '').length)) {
          out.role = l;
        }
      }
    }

    // Company detection: look for 'at <Company>' or 'company:' patterns
    const companyAt = rawText.match(/at\s+([A-Z][A-Za-z0-9 &.-]{2,50})/);
    if (companyAt) out.company = companyAt[1].trim();
    else {
      const compLine = lines.find(l => /company[:\-]/i.test(l));
      if (compLine) out.company = compLine.split(/[:\-]/)[1]?.trim();
    }

    // Education detection: simple degree keywords
    const eduKeywords = ['b.e', 'b.tech', 'bachelor', "b.sc", "m.e", "m.tech", "master", "phd", "mba"];
    const eduLine = lines.find(l => eduKeywords.some(k => l.toLowerCase().includes(k)));
    if (eduLine) out.education = eduLine;

    // Location: look for 'location:' or known city name in a line
    const locLine = lines.find(l => /location[:\-]/i.test(l));
    if (locLine) out.location = locLine.split(/[:\-]/)[1]?.trim();
    else {
      // naive city detection: pick a short line containing a capitalized word
      const cityLine = lines.find(l => /^[A-Z][a-zA-Z]+(?:[\s-][A-Z][a-zA-Z]+)*$/.test(l) && l.length < 30);
      if (cityLine) out.location = cityLine;
    }

    return out;
  }
}

export default AlgorithmResumeParser;

