import React from 'react';

export function ContactSection({ email, phone, location }: { email?: string; phone?: string; location?: string }) {
  if (!email && !phone && !location) return null;
  return (
    <div className="p-4 border-b border-white/5">
      <div className="text-xs text-text-muted mb-2">Contact</div>
      <div className="text-sm text-text-primary space-y-1">
        {email && <div>Email: <a className="text-primary" href={`mailto:${email}`}>{email}</a></div>}
        {phone && <div>Phone: <a className="text-primary" href={`tel:${phone}`}>{phone}</a></div>}
        {location && <div>Location: {location}</div>}
      </div>
    </div>
  );
}

export default ContactSection;
