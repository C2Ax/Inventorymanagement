export type CurrentUser = {
  userId: string;
  username: string;
  role: string;
};

const STORAGE_KEY = "inventory_user";

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = localStorage.getItem(STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as CurrentUser;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}