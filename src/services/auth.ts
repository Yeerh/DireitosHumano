import type { AppUser, SessionData } from "@/types/auth";

const USERS_KEY = "mapeamento_usuarios_v1";
const SESSION_KEY = "mapeamento_auth_v1";

function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionData;
    return parsed?.userId ? parsed : null;
  } catch {
    return null;
  }
}

export function loadUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AppUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: AppUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(input: Omit<AppUser, "id" | "createdAt">) {
  const users = loadUsers();
  const cpf = normalizeDigits(input.cpf);
  const email = input.email.trim().toLowerCase();
  const login = input.login.trim().toLowerCase();

  if (users.some((user) => normalizeDigits(user.cpf) === cpf)) {
    return { ok: false as const, message: "J\u00e1 existe um usu\u00e1rio cadastrado com este CPF." };
  }

  if (users.some((user) => user.email.trim().toLowerCase() === email)) {
    return { ok: false as const, message: "J\u00e1 existe um usu\u00e1rio cadastrado com este e-mail." };
  }

  if (users.some((user) => user.login.trim().toLowerCase() === login)) {
    return { ok: false as const, message: "Este login j\u00e1 est\u00e1 em uso." };
  }

  const user: AppUser = {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    cpf,
    email,
    numero: input.numero.trim(),
    nome: input.nome.trim(),
    login,
    senha: input.senha,
    createdAt: new Date().toISOString(),
  };

  users.unshift(user);
  saveUsers(users);

  return { ok: true as const, user };
}

export function loginUser(identifier: string, senha: string) {
  const users = loadUsers();
  const cleanIdentifier = identifier.trim().toLowerCase();
  const digits = normalizeDigits(identifier);

  const user = users.find((item) => {
    const sameEmail = item.email.trim().toLowerCase() === cleanIdentifier;
    const sameCpf = normalizeDigits(item.cpf) === digits;
    return (sameEmail || sameCpf) && item.senha === senha;
  });

  if (!user) {
    return { ok: false as const, message: "CPF ou e-mail n\u00e3o encontrados, ou senha inv\u00e1lida." };
  }

  const session: SessionData = { userId: user.id };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return { ok: true as const, user };
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): AppUser | null {
  const session = loadSession();
  if (!session) return null;
  return loadUsers().find((user) => user.id === session.userId) ?? null;
}

export function isAuthenticated() {
  return getCurrentUser() !== null;
}
