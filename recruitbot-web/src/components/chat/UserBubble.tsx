import React from 'react';

export function UserBubble({ text, time }: { text?: string; time?: string }) {
  return (
    <div className="flex justify-end mb-2">
      <div className="max-w-[70%] bg-gradient-to-r from-primary to-accent text-white p-3 rounded-xl rounded-br-none">
        <div className="text-sm">{text}</div>
        {time && <div className="text-xs text-white/70 mt-1 text-right">{time}</div>}
      </div>
    </div>
  );
}

export default UserBubble;
