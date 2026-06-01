import React from 'react';

export function WelcomeMessage() {
  return (
    <div className="max-w-prose">
      <div className="text-sm text-text-muted mb-2">Welcome to RecruitBot 👋</div>
      <div className="bg-bg-card p-4 rounded-md text-sm text-text-primary">
        I can search resumes by semantic similarity (Vector), keyword (BM25), or a Hybrid mix. Try a suggestion below to get started.
      </div>
    </div>
  );
}

export default WelcomeMessage;
