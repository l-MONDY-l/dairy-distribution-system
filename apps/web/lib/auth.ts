export type LoggedUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

export function setAuth(token: string, user: LoggedUser) {
  localStorage.setItem('access_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('auth_user');
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function getUser(): LoggedUser | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem('auth_user');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as LoggedUser;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getToken();
}