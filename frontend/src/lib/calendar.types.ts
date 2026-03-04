export type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  location?: string;
  createdAt: string;
};
