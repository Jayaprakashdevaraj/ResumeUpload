import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: 'default' | 'ghost';
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', ...rest }, ref) => {
    const base = 'px-3 py-2 rounded-md border bg-transparent text-text-primary focus:outline-none focus:ring-2';
    const variantClass = variant === 'ghost' ? 'border-transparent bg-white/3' : 'border-white/10';
    const cls = [base, variantClass, className].filter(Boolean).join(' ');
    return <input ref={ref} className={cls} {...rest} />;
  }
);

Input.displayName = 'Input';

export default Input;
