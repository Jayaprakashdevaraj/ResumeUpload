import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import IngestionPage from './features/ingestion/pages/IngestionPage';
import ChatPage from './pages/ChatPage';
import StyleGuide from './pages/StyleGuide';
import { ToastProvider } from './lib/toast';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <nav style={{ padding: 12, background: '#071024' }}>
          <Link to="/" style={{ color: '#9fb4ff', marginRight: 12 }}>Ingestion</Link>
          <Link to="/chat" style={{ color: '#9fb4ff', marginRight: 12 }}>Chat/Search</Link>
          <Link to="/styleguide" style={{ color: '#9fb4ff' }}>Style Guide</Link>
        </nav>
        <Routes>
          <Route path="/" element={<IngestionPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/styleguide" element={<StyleGuide />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
