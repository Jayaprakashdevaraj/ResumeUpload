import React from 'react';
import { cx } from '../utils';

export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  className?: string;
};

export function Icon({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cx(className)}
      {...rest}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default Icon;
