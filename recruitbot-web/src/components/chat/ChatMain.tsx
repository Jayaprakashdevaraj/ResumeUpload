import React, { useEffect } from 'react';
import ChatTopbar from './ChatTopbar';
import ChatMessages from './ChatMessages';
import SuggestionChips from './SuggestionChips';
import ChatInputBar from './ChatInputBar';
import { useChatStore } from '../../lib/stores/chat.store';
import useSearch from '../../hooks/use-search';
import { useSearchStore } from '../../lib/stores/search.store';
import ResultsList from '../results/ResultsList';

export function ChatMain() {
  const messages = useChatStore((s) => s.messages);
  const addBotMessage = useChatStore((s) => s.addBotMessage);
  const { submitQuery } = useSearch();
  const results = useSearchStore((s) => s.results);
  const lastQuery = useSearchStore((s) => s.lastQuery);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { data: any };
      if (detail?.data) {
        const sr = detail.data as any;
        addBotMessage(<ResultsList results={sr.data?.results || sr.results || []} searchType={sr.data?.searchType || sr.searchType} duration={sr.data?.duration || sr.duration || 0} query={sr.data?.query || sr.query || lastQuery} />);
      }
    };
    window.addEventListener('recruitbot:results', handler as EventListener);
    return () => window.removeEventListener('recruitbot:results', handler as EventListener);
  }, [addBotMessage, lastQuery]);

  return (
    <div className="flex-1 flex flex-col">
      <ChatTopbar />
      <div className="flex-1 flex flex-col">
        <ChatMessages />
        {messages.length === 0 && (
          <div className="p-4">
            <SuggestionChips onSubmit={submitQuery} />
          </div>
        )}
        <ChatInputBar onSubmit={submitQuery} />
      </div>
    </div>
  );
}

export default ChatMain;
