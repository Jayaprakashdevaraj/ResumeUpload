import React from 'react';
import { cx } from '../utils';

export type AvatarProps = {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  initials?: string;
};

export function Avatar({ src, alt, size = 40, className, initials }: AvatarProps) {
  const s = size;
  const cls = cx('inline-flex items-center justify-center rounded-full bg-white/5 overflow-hidden', className);
  if (src) {
    return (
      // eslint-disable-next-line jsx-a11y/alt-text
      <img src={src} alt={alt || 'Avatar'} width={s} height={s} style={{ width: s, height: s }} className={cls} />
    );
  }
  return (
    <div className={cls} style={{ width: s, height: s }} aria-hidden>
      <span className="text-sm">{initials || '?'}</span>
    </div>
  );
}

export default Avatar;
