import { useState } from 'react';

export default function useUpload(){
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  return { loading, progress, setLoading, setProgress };
}
