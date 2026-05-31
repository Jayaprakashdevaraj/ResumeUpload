import React from 'react';
import ResumeUploadCard from '../components/ResumeUploadCard';

export default function IngestionPage() {
  return (
    <div className="container">
      <div className="card">
        <h2>Resume Ingestion</h2>
        <p>Phase 1 scaffold: upload UI and services will be added in later phases.</p>
        <ResumeUploadCard />
      </div>
    </div>
  );
}
