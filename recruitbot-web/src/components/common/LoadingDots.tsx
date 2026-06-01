import React from 'react';

export function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 bg-text-muted rounded-full animate-dot-bounce" />
      <span className="w-2 h-2 bg-text-muted rounded-full animate-dot-bounce delay-150" />
      <span className="w-2 h-2 bg-text-muted rounded-full animate-dot-bounce delay-300" />
    </div>
  );
}

export default LoadingDots;
