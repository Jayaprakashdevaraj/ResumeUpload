import React from 'react';
import { useChatStore } from '../../lib/stores/chat.store';

const SUGGESTIONS = [
  { label: '🔍 Selenium QA 3 yrs', text: 'Selenium automation engineer 3 years' },
  { label: '🐍 Python ML dev', text: 'Python developer with machine learning' },
  { label: '☁️ Java AWS backend', text: 'Java backend developer AWS cloud' },
  { label: '⚡ Lead QA Cypress', text: 'Lead QA engineer with Cypress and CI/CD' },
];

export function SuggestionChips({ onSubmit }: { onSubmit?: (q: string) => void }) {
  const { addUserMessage } = useChatStore();

  function handleClick(text: string) {
    addUserMessage(text);
    // dispatch a global event to signal a submit; Phase 13 will hook into this
    const ev = new CustomEvent('recruitbot:submit', { detail: { query: text } });
    window.dispatchEvent(ev);
    if (onSubmit) onSubmit(text);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTIONS.map((s) => (
        <button key={s.text} onClick={() => handleClick(s.text)} className="px-3 py-1 bg-white/5 rounded text-sm">
          {s.label}
        </button>
      ))}
    </div>
  );
}

export default SuggestionChips;
