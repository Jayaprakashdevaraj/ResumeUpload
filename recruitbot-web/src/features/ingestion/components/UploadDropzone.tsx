import React, { useRef, useState } from 'react';

type Props = {
  onFileSelected: (f: File | null) => void;
};

export default function UploadDropzone({ onFileSelected }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [drag, setDrag] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return onFileSelected(null);
    onFileSelected(files[0]);
  }

  return (
    <div>
      <div
        className={`dropzone ${drag ? 'dragover' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <p style={{ margin: 0 }}>Drag & drop a PDF here, or click to select</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
