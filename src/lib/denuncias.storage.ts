import type { Denuncia } from "./denuncias";

const KEY = "mapeamento_denuncias_v1";

export function loadDenuncias(): Denuncia[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Denuncia[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDenuncias(items: Denuncia[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addDenuncia(item: Denuncia) {
  const list = loadDenuncias();
  list.unshift(item);
  saveDenuncias(list);
}
