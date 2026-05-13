const KEY = 'token';

export function getToken() {
  return sessionStorage.getItem(KEY);
}

export function setToken(t) {
  sessionStorage.setItem(KEY, t);
}

export function clearToken() {
  sessionStorage.removeItem(KEY);
}
