import apiClient from './client';

export const chatApi = {
  async sendMessage(message: string) {
    const resp = await apiClient.post('/v1/chat/message', { message });
    return resp.data;
  },
  // stream uses EventSource-compatible SSE endpoint
  streamMessageUrl(message: string) {
    const url = new URL('/v1/chat/stream', apiClient.defaults.baseURL || window.location.origin);
    url.searchParams.set('message', message);
    return url.toString();
  }
};

export default chatApi;
