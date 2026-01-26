import React, { createContext, useContext, useMemo, useState } from "react";
import { findUserByEmail } from "@/lib/users.storage";

type AuthUser = { email: string; id: string };

type LoginResult =
  | { ok: true; user: AuthUser }
  | { ok: false; message: string };

type AuthContextType = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, senha: string) => LoginResult;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_KEY = "portal_auth_v1";
const USER_KEY = "portal_auth_user_v1";

function safeParse<T>(raw: string | null): T | null {
  try {
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function loadSession() {
  const isAuthenticated = localStorage.getItem(AUTH_KEY) === "1";
  const user = safeParse<AuthUser>(localStorage.getItem(USER_KEY));
  return { isAuthenticated, user: user ?? null };
}

function persistSession(user: AuthUser) {
  localStorage.setItem(AUTH_KEY, "1");
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
}

function isEmailValid(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

/** MVP de hash (não use em produção). */
function weakHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return String(h);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial = loadSession();

  const [isAuthenticated, setIsAuthenticated] = useState(initial.isAuthenticated);
  const [user, setUser] = useState<AuthUser | null>(initial.user);

  const value = useMemo<AuthContextType>(() => {
    return {
      isAuthenticated,
      user,

      login: (email: string, senha: string): LoginResult => {
        const e = email.trim().toLowerCase();
        const p = senha.trim();

        if (!e) return { ok: false, message: "Informe o e-mail." };
        if (!isEmailValid(e)) return { ok: false, message: "Informe um e-mail válido." };
        if (!p) return { ok: false, message: "Informe a senha." };

        const u = findUserByEmail(e);
        if (!u) return { ok: false, message: "Conta não encontrada. Faça o cadastro primeiro." };

        if (u.senhaHash !== weakHash(p)) {
          return { ok: false, message: "Senha inválida." };
        }

        const sessionUser = { id: u.id, email: u.email };
        persistSession(sessionUser);
        setIsAuthenticated(true);
        setUser(sessionUser);

        return { ok: true, user: sessionUser };
      },

      logout: () => {
        clearSession();
        setIsAuthenticated(false);
        setUser(null);
      },
    };
  }, [isAuthenticated, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() deve ser usado dentro de <AuthProvider> no main.tsx.");
  }
  return ctx;
}

/** Export do hash para cadastro usar o mesmo padrão */
export { weakHash };
