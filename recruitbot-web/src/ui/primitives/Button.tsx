import React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
};

function join(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  const base = 'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2';
  const variantClass =
    variant === 'primary'
      ? 'bg-primary text-white hover:opacity-95'
      : variant === 'danger'
      ? 'bg-red-600 text-white'
      : 'bg-white/5 text-text-primary';

  return <button className={join(base, variantClass, className)} {...rest} />;
}

export default Button;
