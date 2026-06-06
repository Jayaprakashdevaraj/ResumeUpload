import React from 'react';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  autosize?: boolean;
};

export function Textarea({ className, autosize = false, ...rest }: TextareaProps) {
  const ref = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    if (!autosize || !ref.current) return;
    const ta = ref.current;
    const resize = () => {
      ta.style.height = '0px';
      ta.style.height = Math.max(36, ta.scrollHeight) + 'px';
    };
    resize();
    ta.addEventListener('input', resize);
    return () => ta.removeEventListener('input', resize);
  }, [autosize]);

  const cls = ['w-full px-3 py-2 rounded-md border bg-transparent text-text-primary focus:outline-none focus:ring-2', className]
    .filter(Boolean)
    .join(' ');

  return <textarea ref={ref} className={cls} {...rest} />;
}

export default Textarea;
