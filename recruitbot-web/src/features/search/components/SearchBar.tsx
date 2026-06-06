import React, { useState } from 'react';
import { useSearch } from '../hooks/useSearch';

export default function SearchBar() {
  const [q, setQ] = useState('');
  const { search } = useSearch();

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      search(q);
    }
  }

  return (
    <div className="w-full">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKey}
        placeholder="Search resumes..."
        className="w-full px-3 py-2 rounded-md bg-surface text-text-primary border border-white/5"
      />
    </div>
  );
}
