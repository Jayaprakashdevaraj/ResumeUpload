import React from 'react';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: 'default' | 'accent' | 'success' | 'danger';
};

export function Badge({ className, tone = 'default', children, ...rest }: BadgeProps) {
  const toneClass =
    tone === 'accent' ? 'bg-accent text-white' : tone === 'success' ? 'bg-green-400 text-black' : tone === 'danger' ? 'bg-red-500 text-white' : 'bg-white/5 text-text-primary';
  const cls = ['inline-flex items-center px-2 py-0.5 rounded text-xs', toneClass, className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}

export default Badge;
