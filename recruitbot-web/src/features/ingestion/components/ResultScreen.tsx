import React from 'react';
import { useUploadStore } from '../stores/uploadStore';

export default function ResultScreen(){
  const result = useUploadStore((s)=>s.result);
  if (!result) return null;
  const { id, doc, timings } = result as any;
  return (
    <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: '#061328' }}>
      <h3 style={{ margin: 0 }}>Ingestion Result</h3>
      <div style={{ marginTop: 8 }}>
        <div><strong>ID:</strong> {id}</div>
        <div><strong>File:</strong> {doc?.fileName || 'N/A'}</div>
        <div><strong>Name:</strong> {doc?.name || 'N/A'}</div>
        <div><strong>Role:</strong> {doc?.role || 'N/A'}</div>
        <div><strong>Skills:</strong> {(doc?.skills || []).join(', ') || 'N/A'}</div>
        <div><strong>Embedding dimension:</strong> {Array.isArray(doc?.embedding) ? doc.embedding.length : doc?.embedding?.length || 0}</div>
      </div>
      {timings && (
        <div style={{ marginTop: 10 }}>
          <h4 style={{ margin: '6px 0' }}>Timings</h4>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            <div>Extract: {timings.extractMs} ms</div>
            <div>Clean: {timings.cleanMs} ms</div>
            <div>Parse: {timings.parseMs} ms</div>
            <div>Embedding: {timings.embeddingMs} ms</div>
            <div>DB insert: {timings.mongoInsertMs} ms</div>
            <div style={{ marginTop: 6 }}><strong>Total: {timings.totalMs} ms</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}
