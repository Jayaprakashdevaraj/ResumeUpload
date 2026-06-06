import React from 'react';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: 'div' | 'section' | 'article';
};

export function Card({ className, children, ...rest }: CardProps) {
  const cls = ['p-4 rounded-md bg-card shadow-sm', className].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}

export default Card;
