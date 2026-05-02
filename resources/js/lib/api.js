import axios from 'axios';

/**
 * API origin from env (Vercel / standalone frontend).
 * Set `VITE_API_URL` or `REACT_APP_API_URL` to your Laravel base URL (scheme + host + optional port), no trailing slash.
 * Empty → same-origin `/api` (Laravel app serving Vite).
 */
function resolveApiBaseURL() {
    const raw = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || '';
    const trimmed = String(raw).trim().replace(/\/$/, '');
    if (!trimmed) {
        return '/api';
    }

    return `${trimmed}/api`;
}

export const api = axios.create({
    baseURL: resolveApiBaseURL(),
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

const TOKEN_KEY = 'sf_admin_token';

export function getStoredToken() {
    return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
    if (token) {
        window.localStorage.setItem(TOKEN_KEY, token);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        window.localStorage.removeItem(TOKEN_KEY);
        delete api.defaults.headers.common.Authorization;
    }
}

export function initApiAuth() {
    const t = getStoredToken();
    if (t) {
        api.defaults.headers.common.Authorization = `Bearer ${t}`;
    }
}
