import axios from 'axios';

// When opened via ngrok or from another device (tablet/phone), browser must use same-origin /api
// so Next.js can proxy to the backend. Using localhost in the browser would fail from tablet.
function getBaseURL(): string {
  const explicit = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof window !== 'undefined') {
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (explicit && (isLocal || !/localhost|127\.0\.0\.1/.test(explicit)))
      return explicit;
    return '/api';
  }
  return explicit || process.env.API_SERVER_URL || 'http://localhost:3001';
}

export const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});