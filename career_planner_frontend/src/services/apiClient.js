const BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

class ApiClient {
  constructor() {
    // Normalize to avoid double slashes when concatenating with relative path
    this.base = BASE_URL.replace(/\/$/, '');
    this.token = null;
  }

  // PUBLIC_INTERFACE
  setAuthToken(token) {
    /** Set bearer token (Supabase JWT) to include in subsequent API calls. */
    this.token = token;
  }

  async request(path, options = {}) {
    const p = path.startsWith('/') ? path : `/${path}`;
    const url = `${this.base}${p}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(options.headers || {})
    };
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
      const message = (data && (data.detail || data.message)) || res.statusText;
      throw new Error(message);
    }
    return data;
  }

  // PUBLIC_INTERFACE
  get(path) {
    /** GET wrapper for backend requests. */
    return this.request(path, { method: 'GET' });
  }

  // PUBLIC_INTERFACE
  post(path, body) {
    /** POST wrapper for backend requests with JSON body. */
    return this.request(path, { method: 'POST', body: JSON.stringify(body) });
  }

  // PUBLIC_INTERFACE
  put(path, body) {
    /** PUT wrapper for backend requests with JSON body. */
    return this.request(path, { method: 'PUT', body: JSON.stringify(body) });
  }
}

export const apiClient = new ApiClient();
