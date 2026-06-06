import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../../lib/stores/chat.store';
import ChatInputBar from '../../../components/chat/ChatInputBar';
import chatApi from '../../../lib/api/chat.api';

export default function ChatPanel() {
  const messages = useChatStore((s) => s.messages);
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const addBotMessage = useChatStore((s) => s.addBotMessage);
  const [loading, setLoading] = useState(false);

  async function handleSend(q: string) {
    addUserMessage(q);
    setLoading(true);
    try {
      // first try streaming via SSE
      const url = chatApi.streamMessageUrl(q);
      const evtSource = new EventSource(url);
      let collected = '';
      evtSource.addEventListener('message', (e: any) => {
        try {
          const d = JSON.parse(e.data);
          collected += d.reply || '';
        } catch {
          collected += e.data || '';
        }
      });
      evtSource.addEventListener('done', () => {
        addBotMessage(collected || 'No response');
        evtSource.close();
        setLoading(false);
      });
      evtSource.addEventListener('error', () => {
        evtSource.close();
        setLoading(false);
      });
    } catch (err) {
      // fallback to single request
      try {
        const r = await chatApi.sendMessage(q);
        addBotMessage(r.reply || 'No reply');
      } catch (e) {
        addBotMessage('Chat failed');
      }
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-3">
        {messages.map((m) => (
          <div key={m.id} className={m.type === 'user' ? 'text-right mb-2' : 'text-left mb-2'}>
            <div className={`inline-block p-3 rounded ${m.type === 'user' ? 'bg-primary text-white' : 'bg-card text-text-primary'}`}>
              {m.type === 'user' ? m.text : m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5">
        <ChatInputBar onSubmit={handleSend} />
      </div>
    </div>
  );
}
