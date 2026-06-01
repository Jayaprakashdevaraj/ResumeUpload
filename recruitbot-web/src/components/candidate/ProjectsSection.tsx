import React from 'react';

export function ProjectsSection({ projects }: { projects?: { title: string; description?: string }[] }) {
  if (!projects || projects.length === 0) return null;
  return (
    <div className="p-4 border-b border-white/5">
      <div className="text-xs text-text-muted mb-2">Projects</div>
      <div className="space-y-3">
        {projects.map((p, i) => (
          <div key={i}>
            <div className="text-sm font-medium">{p.title}</div>
            {p.description && <div className="text-sm text-text-primary">{p.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectsSection;
