import React from 'react';

export function BrandAvatar() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">RB</div>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-text-primary">RecruitBot</div>
        <div className="text-xs text-text-muted flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-status-pulse block" />
          <span>Online</span>
        </div>
      </div>
    </div>
  );
}

export default BrandAvatar;
