import React from 'react';

export function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-start mb-2">
      <div className="max-w-[75%] bg-bg-card p-3 rounded-xl rounded-bl-none text-text-primary">
        {children}
      </div>
    </div>
  );
}

export default BotBubble;
