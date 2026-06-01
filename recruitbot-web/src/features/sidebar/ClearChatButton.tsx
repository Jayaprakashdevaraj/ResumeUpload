import React from 'react';
import { useChatStore } from '../../lib/stores/chat.store';

export function ClearChatButton() {
  const { clearMessages } = useChatStore();

  return (
    <div>
      <button
        onClick={() => clearMessages()}
        className="w-full mt-3 px-3 py-2 bg-red-600/10 text-red-400 text-sm rounded-md"
      >
        Clear chat
      </button>
    </div>
  );
}

export default ClearChatButton;
