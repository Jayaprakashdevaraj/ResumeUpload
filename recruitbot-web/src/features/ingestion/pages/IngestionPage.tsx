import React from 'react';
import ResumeUploadCard from '../components/ResumeUploadCard';
import { Link } from 'react-router-dom';

export default function IngestionPage() {
  return (
    <div className="container">
      <div className="card">
        <h2>Resume Ingestion</h2>
        <p>Phase 1 scaffold: upload UI and services will be added in later phases.</p>
        <ResumeUploadCard />

        <div className="mt-4">
          <p className="text-sm text-text-muted mb-2">Want to try the Chat/Search UI?</p>
          <Link to="/chat" className="inline-block px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded">Open Chat / Search</Link>
        </div>
      </div>
    </div>
  );
}
