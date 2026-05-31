import React from 'react';
import { useUploadStore } from '../stores/uploadStore';

export default function IngestionStages(){
  const stages = useUploadStore((s: any) => s.stages);
  const progress = useUploadStore((s)=>s.progress);
  const timings = useUploadStore((s:any)=>s.timings);

  return (
    <div style={{ marginTop: 12 }}>
      {stages.map((st: any) => (
        <div key={st.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, marginRight: 8, background: st.status === 'done' ? '#22c55e' : st.status === 'pending' ? '#f59e0b' : '#334155' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14 }}>{st.label}</div>
            {st.key === 'upload' && st.status === 'pending' && (
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{progress}% uploaded</div>
            )}
            {timings && st.key === 'processing' && timings.extractMs != null && (
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Extract: {timings.extractMs}ms</div>
            )}
            {timings && st.key === 'parsing' && timings.parseMs != null && (
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Parse: {timings.parseMs}ms</div>
            )}
            {timings && st.key === 'embedding' && timings.embeddingMs != null && (
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Embedding: {timings.embeddingMs}ms</div>
            )}
            {timings && st.key === 'mongo' && timings.mongoInsertMs != null && (
              <div style={{ fontSize: 12, color: '#94a3b8' }}>DB write: {timings.mongoInsertMs}ms</div>
            )}
            {timings && st.key === 'completed' && timings.totalMs != null && (
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Total: {timings.totalMs}ms</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
