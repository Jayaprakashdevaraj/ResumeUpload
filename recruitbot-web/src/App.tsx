import React from 'react';
import IngestionPage from './features/ingestion/pages/IngestionPage';
import { ToastProvider } from './lib/toast';

export default function App() {
  return (
    <ToastProvider>
      <div>
        <h1 style={{ fontFamily: 'Arial, sans-serif', margin: 16 }}>RecruitBot — Phase 1 (Ingestion Scaffold)</h1>
        <IngestionPage />
      </div>
    </ToastProvider>
  );
}
