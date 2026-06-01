import React from 'react';

export function CertificationsSection({ certifications }: { certifications?: string[] }) {
  if (!certifications || certifications.length === 0) return null;
  return (
    <div className="p-4 border-b border-white/5">
      <div className="text-xs text-text-muted mb-2">Certifications</div>
      <ul className="list-disc ml-4 text-sm text-text-primary">
        {certifications.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}

export default CertificationsSection;
