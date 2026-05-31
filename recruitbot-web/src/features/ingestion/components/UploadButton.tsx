import React from 'react';
import { useUploadStore } from '../stores/uploadStore';

type Props = { file: File | null; onClick: () => void };

export default function UploadButton({ file, onClick }: Props) {
  const loading = useUploadStore((s) => s.loading);

  return (
    <button
      className="upload-button"
      onClick={onClick}
      disabled={!file || loading}
    >
      {loading ? 'Uploading...' : file ? `Upload ${file.name}` : 'Select a file'}
    </button>
  );
}
