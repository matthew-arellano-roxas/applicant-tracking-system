import axios, { type AxiosError } from 'axios';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    retryCount?: number;
  }
}

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const maxReadRetries = 4;
const retryableMethods = new Set(['get', 'head', 'options']);
const retryableStatuses = new Set([408, 425, 429]);

function getRetryDelay(error: AxiosError, retryCount: number) {
  const retryAfter = error.response?.headers['retry-after'];
  if (typeof retryAfter === 'string') {
    const seconds = Number(retryAfter);
    const retryAfterDate = Date.parse(retryAfter);
    const serverDelay = Number.isFinite(seconds)
      ? seconds * 1000
      : Number.isNaN(retryAfterDate)
        ? null
        : retryAfterDate - Date.now();
    if (serverDelay !== null && serverDelay > 0) return Math.min(serverDelay, 10_000);
  }

  const exponentialDelay = Math.min(500 * 2 ** (retryCount - 1), 4_000);
  return Math.round(exponentialDelay * (0.8 + Math.random() * 0.4));
}

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config;
  if (!config || axios.isCancel(error) || error.code === 'ERR_CANCELED') throw error;

  const method = config.method?.toLowerCase() ?? 'get';
  const retryCount = config.retryCount ?? 0;
  const status = error.response?.status;
  const isTransientFailure =
    status === undefined ||
    retryableStatuses.has(status) ||
    status >= 500;

  if (!retryableMethods.has(method) || !isTransientFailure || retryCount >= maxReadRetries) {
    throw error;
  }

  config.retryCount = retryCount + 1;
  await new Promise((resolve) => window.setTimeout(resolve, getRetryDelay(error, config.retryCount!)));
  return api.request(config);
});
