import type { CalendarEvent } from "./calendar.types";

const KEY = "mapeamento_calendar_events_v1";

export function loadEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CalendarEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEvents(items: CalendarEvent[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addEvent(item: CalendarEvent) {
  const list = loadEvents();
  list.unshift(item);
  saveEvents(list);
}

export function deleteEvent(id: string) {
  const list = loadEvents().filter((e) => e.id !== id);
  saveEvents(list);
}
