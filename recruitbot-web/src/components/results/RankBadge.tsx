import React from 'react';

export function RankBadge({ rank }: { rank: number }) {
  const cls = rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black' : 'bg-white/5 text-text-primary';
  return <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${cls}`}>#{rank}</div>;
}

export default RankBadge;
