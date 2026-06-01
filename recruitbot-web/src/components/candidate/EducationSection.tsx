import React from 'react';

export function EducationSection({ education }: { education?: { degree: string; institution: string; year?: string }[] }) {
  if (!education || education.length === 0) return null;
  return (
    <div className="p-4 border-b border-white/5">
      <div className="text-xs text-text-muted mb-2">Education</div>
      <div className="space-y-2">
        {education.map((e, i) => (
          <div key={i}>
            <div className="text-sm font-medium">{e.degree}</div>
            <div className="text-xs text-text-muted">{e.institution}{e.year ? ` · ${e.year}` : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EducationSection;
