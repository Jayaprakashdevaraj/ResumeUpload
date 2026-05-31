import axios, { AxiosInstance } from 'axios';

const client: AxiosInstance = axios.create({ baseURL: '/', timeout: 30000 });

// basic response interceptor to return data or throw normalized error
client.interceptors.response.use(
  (resp) => resp,
  (err) => {
    const e = err as any;
    if (e.response && e.response.data) return Promise.reject(e.response);
    return Promise.reject(e);
  }
);

export default {
  // inject accepts an optional onProgress callback (0-100)
  inject: async (formData: FormData, onProgress?: (p: number) => void) => {
    const resp = await client.post('/v1/resume/inject', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt: ProgressEvent) => {
        if (!evt.lengthComputable) return;
        const pct = Math.round((evt.loaded * 100) / evt.total);
        onProgress?.(pct);
      }
    });
    return resp.data;
  }
};
