import type { PortalUser } from "./users.types";

const KEY = "portal_users_v1";

function safeParse<T>(raw: string | null): T | null {
  try {
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadUsers(): PortalUser[] {
  const data = safeParse<PortalUser[]>(localStorage.getItem(KEY));
  return Array.isArray(data) ? data : [];
}

export function saveUsers(users: PortalUser[]) {
  localStorage.setItem(KEY, JSON.stringify(users));
}

export function findUserByEmail(email: string) {
  const e = email.trim().toLowerCase();
  return loadUsers().find((u) => u.email.toLowerCase() === e) ?? null;
}

export function findUserByCpf(cpfDigits: string) {
  return loadUsers().find((u) => u.cpf === cpfDigits) ?? null;
}

export function createUser(user: PortalUser) {
  const users = loadUsers();
  users.unshift(user);
  saveUsers(users);
}
