import React from 'react';
import { cx } from '../utils';

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactElement;
  className?: string;
};

export function Tooltip({ content, children, className }: TooltipProps) {
  const child = React.Children.only(children) as React.ReactElement<any>;
  const combined = cx((child.props && child.props.className) || '', className);
  return React.cloneElement(child, {
    title: typeof content === 'string' ? content : undefined,
    'aria-label': typeof content === 'string' ? content : undefined,
    className: combined,
  });
}

export default Tooltip;
