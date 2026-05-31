import React from 'react';
import UploadDropzone from './UploadDropzone';
import UploadButton from './UploadButton';
import UploadProgress from './UploadProgress';
import api from '../services/api';
import IngestionStages from './IngestionStages';
import ResultScreen from './ResultScreen';
import ValidationRules from './ValidationRules';
import { useToast } from '../../../lib/toast';
import { useUploadStore } from '../stores/uploadStore';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function ResumeUploadCard() {
  const file = useUploadStore((s) => s.file);
  const error = useUploadStore((s) => s.error);
  const success = useUploadStore((s) => s.success);
  const result = useUploadStore((s) => s.result);
  const setLoading = useUploadStore((s) => s.setLoading);
  const setProgress = useUploadStore((s) => s.setProgress);
  const setResult = useUploadStore((s) => s.setResult);
  const setFile = useUploadStore((s) => s.setFile);
  const setError = useUploadStore((s) => s.setError);
  const setSuccess = useUploadStore((s) => s.setSuccess);
  const reset = useUploadStore((s) => s.reset);
  const setStageStatus = useUploadStore((s:any)=>s.setStageStatus);
  const setTimings = useUploadStore((s:any)=>s.setTimings);
  const toast = useToast();
  const maxRetries = 2;

  function validateFile(f: File) {
    if (f.type !== 'application/pdf') return 'Only PDF files are allowed';
    if (f.size > MAX_SIZE) return 'Maximum 5MB allowed';
    return null;
  }

  const onFileSelected = (f: File | null) => {
    setError(null);
    setSuccess(null);
    if (!f) {
      setFile(null);
      return;
    }
    const v = validateFile(f);
    if (v) {
      setError(v);
      setFile(null);
      return;
    }
    setFile(f);
  };

  const upload = async (attempt = 0) => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    setProgress(0);
    // mark upload stage pending
    setStageStatus('upload','pending');
    // mark downstream stages pending while server processes
    setStageStatus('processing','pending');
    setStageStatus('parsing','pending');
    setStageStatus('embedding','pending');
    setStageStatus('mongo','pending');

    try {
      const form = new FormData();
      form.append('file', file, file.name);
      const data = await api.inject(form, (p: number) => setProgress(p));
      setSuccess('Upload successful');
      setResult(data);
      toast.success('Upload completed');
      // upload complete
      setStageStatus('upload','done');
      // if server returned timings, mark downstream stages done
      if (data?.timings) {
        setTimings(data.timings);
        setStageStatus('processing','done');
        setStageStatus('parsing','done');
        setStageStatus('embedding','done');
        setStageStatus('mongo','done');
        setStageStatus('completed','done');
      } else {
        // fallback: mark completed
        setStageStatus('completed','done');
      }
    } catch (err: any) {
      const status = err?.status || err?.statusCode || err?.data?.status;
      const code = err?.data?.code || err?.code;
      // detect transient server errors
      const isTransient = (status && status >= 500) || code === 'EMBEDDING_FAILED' || code === 'MONGO_INGEST_FAILED';
      if (isTransient && attempt < maxRetries) {
        const wait = 1000 * Math.pow(2, attempt);
        toast.info(`Retrying upload in ${wait/1000}s... (attempt ${attempt+1})`);
        await new Promise((r) => setTimeout(r, wait));
        return upload(attempt + 1);
      }
      // map known backend error codes to friendly messages (reuse `code` from above)
      let message = err?.data?.error || err?.message || 'Upload failed';
      if (code === 'INVALID_FILE') message = 'Invalid file: only PDF files supported';
      if (code === 'EMPTY_RESUME') message = 'PDF extraction failed - file may be empty or corrupted';
      if (code === 'EMBEDDING_FAILED') message = 'Embedding generation failed';
      if (code === 'MONGO_INGEST_FAILED') message = 'Failed to save resume to database';
      setError(message);
      toast.error(message);
      // mark failed stage
      setStageStatus('processing','failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ValidationRules />
      <UploadDropzone onFileSelected={onFileSelected} />
      {error && <div style={{ color: '#ff6b6b', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: '#7efc6e', marginTop: 8 }}>{success}</div>}
      {/* Result screen shows parsed fields, embedding info and timings */}
      {result && <ResultScreen />}
      <UploadProgress />
      <IngestionStages />
      <div style={{ marginTop: 12 }}>
        <UploadButton file={file} onClick={upload} />
        <button style={{ marginLeft: 8 }} onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
