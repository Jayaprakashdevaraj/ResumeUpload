import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../lib/stores/chat.store';
import { useSearchStore } from '../../lib/stores/search.store';

export function ChatInputBar({ onSubmit }: { onSubmit?: (q: string) => void }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { addUserMessage } = useChatStore();
  const setSearching = useSearchStore((s) => s.setSearching);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { query: string };
      if (detail?.query) submit(detail.query);
    };
    window.addEventListener('recruitbot:submit', handler as EventListener);
    return () => window.removeEventListener('recruitbot:submit', handler as EventListener);
  }, []);

  function submit(q?: string) {
    const txt = q ?? value.trim();
    if (!txt) return;
    addUserMessage(txt);
    setValue('');
    setSearching(true);
    if (onSubmit) onSubmit(txt);
    else window.dispatchEvent(new CustomEvent('recruitbot:search', { detail: { query: txt } }));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="border-t border-white/5 p-3 flex items-end gap-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          // autosize
          const ta = textareaRef.current;
          if (ta) {
            ta.style.height = 'auto';
            const max = 144; // px (~6 lines)
            const newH = Math.min(ta.scrollHeight, max);
            ta.style.height = `${newH}px`;
            ta.style.overflowY = ta.scrollHeight > max ? 'auto' : 'hidden';
          }
        }}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="Type your query... Press Enter to search"
        className="flex-1 bg-bg-card text-text-primary p-2 rounded resize-none"
        style={{ maxHeight: 144, overflowY: 'auto' }}
      />
      <button onClick={() => submit()} className="px-3 py-2 bg-gradient-to-r from-primary to-accent text-white rounded">
        Send
      </button>
    </div>
  );
}

export default ChatInputBar;
