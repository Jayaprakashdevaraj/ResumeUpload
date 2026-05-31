import create from 'zustand';

type State = {
  loading: boolean;
  progress: number;
  result?: any;
  file?: File | null;
  error?: string | null;
  success?: string | null;
  setLoading: (v: boolean) => void;
  setProgress: (v: number) => void;
  setResult: (r: any) => void;
  setFile: (f: File | null) => void;
  setError: (e: string | null) => void;
  setSuccess: (s: string | null) => void;
  reset: () => void;
}

export const useUploadStore = create<State>((set) => ({
  loading: false,
  progress: 0,
  result: undefined,
  file: null,
  error: null,
  success: null,
  setLoading: (v) => set({ loading: v }),
  setProgress: (v) => set({ progress: v }),
  setResult: (r) => set({ result: r }),
  timings: undefined,
  stages: [
    { key: 'upload', label: 'Resume Upload', status: 'idle' },
    { key: 'processing', label: 'PDF Processing', status: 'idle' },
    { key: 'parsing', label: 'Resume Parsing', status: 'idle' },
    { key: 'embedding', label: 'Embedding Generation', status: 'idle' },
    { key: 'mongo', label: 'MongoDB ingestion', status: 'idle' },
    { key: 'completed', label: 'Completed', status: 'idle' }
  ],
  setTimings: (t) => set({ timings: t }),
  setStageStatus: (key, status) => set((s: any) => ({ stages: s.stages.map((st: any) => (st.key === key ? { ...st, status } : st)) })),
  setFile: (f) => set({ file: f }),
  setError: (e) => set({ error: e }),
  setSuccess: (s) => set({ success: s }),
  reset: () => set({ loading: false, progress: 0, result: undefined, file: null, error: null, success: null })
}));
