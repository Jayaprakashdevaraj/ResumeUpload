import React from 'react';
import { cx } from '../utils';

export type DropdownProps = {
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function Dropdown({ label, children, className }: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <div ref={ref} className={cx('relative inline-block', className)}>
      <button onClick={() => setOpen((v) => !v)} className="px-3 py-1 rounded bg-white/5">
        {label}
      </button>
      {open && <div className="absolute mt-2 bg-card p-2 rounded shadow z-20">{children}</div>}
    </div>
  );
}

export default Dropdown;
