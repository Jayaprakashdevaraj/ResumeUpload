import { create } from 'zustand';

type Message = { id: string; type: 'user' | 'bot'; text?: string; content?: any; timestamp: string };

interface ChatState {
  messages: Message[];
  addUserMessage: (text: string) => void;
  addBotMessage: (content: any) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addUserMessage: (text) => set((s) => ({ messages: [...s.messages, { id: Math.random().toString(36).slice(2), type: 'user', text, timestamp: new Date().toISOString() }] })),
  addBotMessage: (content) => set((s) => ({ messages: [...s.messages, { id: Math.random().toString(36).slice(2), type: 'bot', content, timestamp: new Date().toISOString() }] })),
  clearMessages: () => set({ messages: [] })
}));
