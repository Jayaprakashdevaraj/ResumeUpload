import React from 'react';
import { useUploadStore } from '../stores/uploadStore';

export default function UploadProgress(){
  const progress = useUploadStore((s)=>s.progress);
  const loading = useUploadStore((s)=>s.loading);
  if (!loading) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div style={{ fontSize: 12, marginTop: 6 }}>{progress}%</div>
    </div>
  );
}
