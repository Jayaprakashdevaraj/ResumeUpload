import React from 'react';
import Sidebar from './layout/Sidebar';
import CandidateModal from './candidate/CandidateModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex bg-bg-base text-text-primary">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <CandidateModal />
    </div>
  );
}

