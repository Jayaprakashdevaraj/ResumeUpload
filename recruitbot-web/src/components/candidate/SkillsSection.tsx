import React from 'react';

export function SkillsSection({ skills }: { skills?: string[] }) {
  if (!skills || skills.length === 0) return null;
  return (
    <div className="p-4 border-b border-white/5">
      <div className="text-xs text-text-muted mb-2">Skills</div>
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span key={s} className="text-xs px-2 py-1 rounded bg-indigo-500/10 text-indigo-300">{s}</span>
        ))}
      </div>
    </div>
  );
}

export default SkillsSection;
