import type { Triagem } from "./triagem.types";

const KEY = "portal_triagem_v1";
const ACTIVE_KEY = "portal_triagem_ativa_v1";

export function saveTriagem(item: Triagem) {
  const list = loadTriagens();
  list.unshift(item);
  localStorage.setItem(KEY, JSON.stringify(list));
  localStorage.setItem(ACTIVE_KEY, item.id);
}

export function loadTriagens(): Triagem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Triagem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getActiveTriagemId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}
