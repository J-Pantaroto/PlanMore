import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';


let __csrfReady;


axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {

      router.visit('/login');
    }
    if (error.response && error.response.status === 419) {

      router.visit('/login');
    }
    return Promise.reject(error);
  }
);

export function ensureCsrf() {
  if (!__csrfReady) {
    __csrfReady = fetch("/sanctum/csrf-cookie", {
      credentials: "include",
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });
  }
  return __csrfReady;
}

function getCookie(name) {
  const m = document.cookie.match(new RegExp('(^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return m ? m[2] : null;
}


export async function api(path, { method = "GET", params, body } = {}) {
  if (method !== "GET") await ensureCsrf();

  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }

  const headers = {
    "X-Requested-With": "XMLHttpRequest",
    "Accept": "application/json",
  };
  if (body) headers["Content-Type"] = "application/json";

  const xsrf = getCookie("XSRF-TOKEN");
  if (xsrf) headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrf);

  const res = await fetch(url.toString(), {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let err;
    try { err = await res.json(); } catch { err = { message: res.statusText }; }
    throw err;
  }

  try { return await res.json(); } catch { return null; }
}