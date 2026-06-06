import React from 'react';
import { Experience } from '../../types/candidate.types';
import { sanitizeHtml } from '../../lib/sanitize';

export function ExperienceSection({ experience }: { experience?: Experience[] }) {
  if (!experience || experience.length === 0) return null;
  return (
    <div className="p-4 border-b border-white/5">
      <div className="text-xs text-text-muted mb-2">Experience</div>
      <ol className="space-y-3">
        {experience.map((exp, idx) => (
          <li key={idx} className="">
            <div className="text-sm font-semibold">{exp.title} <span className="text-xs text-text-muted">@ {exp.company}</span></div>
            {exp.duration && <div className="text-xs text-text-muted">{exp.duration}</div>}
            {exp.description && (
              <div className="text-sm text-text-primary mt-1" dangerouslySetInnerHTML={{ __html: sanitizeHtml(exp.description) }} />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default ExperienceSection;
