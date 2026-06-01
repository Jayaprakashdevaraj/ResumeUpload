import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../lib/stores/chat.store';
import UserBubble from './UserBubble';
import BotBubble from './BotBubble';
import LoadingDots from '../common/LoadingDots';
import { useSearchStore } from '../../lib/stores/search.store';

export function ChatMessages() {
  const messages = useChatStore((s) => s.messages);
  const isSearching = useSearchStore((s) => s.isSearching);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, isSearching]);

  return (
    <div ref={ref} className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((m) =>
        m.type === 'user' ? (
          <UserBubble key={m.id} text={m.text} time={new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
        ) : (
          <BotBubble key={m.id}>{m.content || m.text}</BotBubble>
        )
      )}

      {isSearching && (
        <BotBubble>
          <LoadingDots />
        </BotBubble>
      )}
    </div>
  );
}

export default ChatMessages;
