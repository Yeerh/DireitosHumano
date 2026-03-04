import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addEvent, deleteEvent, loadEvents } from "@/lib/calendar.storage";
import type { CalendarEvent } from "@/lib/calendar.types";
import { loadTerreiros } from "@/services/storage";
import type { Terreiro } from "@/types/terreiro";

type DayCell = {
  ymd: string;
  day: number;
  inMonth: boolean;
};

function uid() {
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString();
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toYMD(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function monthLabel(d: Date) {
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function weekdayMon0(date: Date) {
  return (date.getDay() + 6) % 7;
}

function buildMonthDays(refDate: Date): DayCell[] {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = weekdayMon0(first);
  const totalCells = Math.ceil((leading + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, i) => {
    const dayOffset = i - leading + 1;
    const current = new Date(year, month, dayOffset);
    return {
      ymd: toYMD(current),
      day: current.getDate(),
      inMonth: dayOffset >= 1 && dayOffset <= daysInMonth,
    };
  });
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState(() => toYMD(new Date()));
  const [modalOpen, setModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    date: toYMD(new Date()),
    title: "",
    description: "",
    location: "",
  });

  const terreiros = useMemo(() => loadTerreiros(), [refresh]);
  const events = useMemo(() => loadEvents(), [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terreiros;

    return terreiros.filter((item) => {
      const blob = [
        item.nomeCasa,
        item.liderReligioso,
        item.endereco,
        item.segmento,
        item.email,
        item.telefone,
        item.racaCor,
      ]
        .join(" ")
        .toLowerCase();

      return blob.includes(q);
    });
  }, [query, terreiros]);

  const monthDays = useMemo(() => buildMonthDays(month), [month]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }

    return map;
  }, [events]);

  const selectedEvents = useMemo(() => eventsByDate.get(selected) ?? [], [eventsByDate, selected]);

  const monthEventsCount = useMemo(() => {
    const key = `${month.getFullYear()}-${pad2(month.getMonth() + 1)}-`;
    return events.filter((event) => event.date.startsWith(key)).length;
  }, [events, month]);

  function prevMonth() {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  function nextMonth() {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  function openEventModal(date?: string) {
    const eventDate = date ?? selected;
    setNewEvent({ date: eventDate, title: "", description: "", location: "" });
    setModalOpen(true);
  }

  function saveEvent() {
    if (newEvent.title.trim().length < 3) return;

    addEvent({
      id: uid(),
      date: newEvent.date,
      title: newEvent.title.trim(),
      description: newEvent.description.trim() || undefined,
      location: newEvent.location.trim() || undefined,
      createdAt: new Date().toISOString(),
    });

    setModalOpen(false);
    setRefresh((current) => current + 1);
  }

  return (
    <div className="split-grid">
      <section className="panel panel-hero">
        <div className="panel-body">
          <div className="panel-head">
            <div>
              <h2 className="page-title">Painel de mapeamento</h2>
              <p className="page-subtitle">
                Consulte registros, acompanhe eventos e mantenha o sistema sempre atualizado.
              </p>
            </div>

            <div className="actions-row">
              <Link to="/cadastro" className="btn btn-primary">
                Novo cadastro
              </Link>
              <button type="button" className="btn btn-secondary" onClick={() => openEventModal()}>
                Novo evento
              </button>
            </div>
          </div>

          <div className="quick-stats">
            <div className="stat-box">
              <p className="stat-label">Registros totais</p>
              <p className="stat-value">{terreiros.length}</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Resultado da busca</p>
              <p className="stat-value">{filtered.length}</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">{"Eventos no m\u00eas"}</p>
              <p className="stat-value">{monthEventsCount}</p>
            </div>
          </div>

          <div className="search-row">
            <input
              className="field-input"
              placeholder={"Buscar por nome da casa, l\u00edder, endere\u00e7o, segmento ou contato"}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="button" className="btn btn-secondary" onClick={() => setRefresh((current) => current + 1)}>
              Atualizar dados
            </button>
          </div>
        </div>
      </section>

      <section className="calendar-layout">
        <article className="panel">
          <div className="panel-body">
            <div className="panel-head">
              <h3 className="page-title" style={{ fontSize: "1.24rem" }}>
                {"Calend\u00e1rio institucional"}
              </h3>
              <div className="actions-row">
                <button type="button" className="btn btn-secondary" onClick={prevMonth}>
                  {"<"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={nextMonth}>
                  {">"}
                </button>
              </div>
            </div>

            <p className="page-subtitle month-chip" style={{ textTransform: "capitalize" }}>
              {monthLabel(month)}
            </p>

            <div className="calendar-grid calendar-head">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((day) => (
                <div key={day} className="calendar-weekday">
                  {day}
                </div>
              ))}
            </div>

            <div className="calendar-grid">
              {monthDays.map((day) => {
                const hasEvents = (eventsByDate.get(day.ymd)?.length ?? 0) > 0;
                const isSelected = selected === day.ymd;

                return (
                  <button
                    key={day.ymd}
                    type="button"
                    className={`day-button${!day.inMonth ? " outside" : ""}${isSelected ? " selected" : ""}`}
                    onClick={() => setSelected(day.ymd)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{day.day}</span>
                      {hasEvents ? <span className="dot" /> : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <button type="button" className="btn btn-primary" onClick={() => openEventModal(selected)}>
                Adicionar em {selected}
              </button>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-body">
            <div className="panel-head">
              <h3 className="page-title" style={{ fontSize: "1.2rem" }}>
                Eventos do dia
              </h3>
              <span className="text-xs font-semibold text-slate-500">{selected}</span>
            </div>

            {selectedEvents.length === 0 ? (
              <p className="page-subtitle">Nenhum evento para a data selecionada.</p>
            ) : (
              <div className="event-list">
                {selectedEvents.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="m-0 text-sm font-bold text-slate-900">{event.title}</p>
                        {event.location ? (
                          <p className="mt-1 text-xs font-semibold text-slate-600">{event.location}</p>
                        ) : null}
                        {event.description ? (
                          <p className="mt-1 text-xs text-slate-600">{event.description}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          deleteEvent(event.id);
                          setRefresh((current) => current + 1);
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-body">
          <div className="panel-head">
            <div>
              <h3 className="page-title" style={{ fontSize: "1.24rem" }}>
                Lista de casas cadastradas
              </h3>
              <p className="page-subtitle">
                {"Dados dispon\u00edveis para consulta r\u00e1pida e navega\u00e7\u00e3o de detalhes."}
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="page-subtitle" style={{ marginTop: "0.9rem" }}>
              {"Nenhum registro encontrado. Use o bot\u00e3o de novo cadastro para iniciar."}
            </p>
          ) : (
            <div className="table-wrap" style={{ marginTop: "0.9rem" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Casa</th>
                    <th>Segmento</th>
                    <th>{"L\u00edder"}</th>
                    <th>Ano</th>
                    <th>{"A\u00e7\u00f5es"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item: Terreiro) => (
                    <tr key={item.id}>
                      <td className="font-bold text-slate-900">{item.nomeCasa}</td>
                      <td>{item.segmento}</td>
                      <td>{item.liderReligioso}</td>
                      <td>{item.anoFundacao}</td>
                      <td>
                        <Link to={`/detalhes/${item.id}`} className="btn btn-secondary">
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {modalOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="panel-body">
              <h4 className="page-title" style={{ fontSize: "1.15rem" }}>
                Novo evento
              </h4>
              <p className="page-subtitle">Preencha os campos para registrar uma nova atividade.</p>

              <div className="field-group" style={{ marginTop: "1rem" }}>
                <div>
                  <label className="field-label" htmlFor="event-date">
                    Data
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    className="field-input"
                    value={newEvent.date}
                    onChange={(event) => setNewEvent((state) => ({ ...state, date: event.target.value }))}
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="event-title">
                    {"T\u00edtulo"}
                  </label>
                  <input
                    id="event-title"
                    className="field-input"
                    value={newEvent.title}
                    onChange={(event) => setNewEvent((state) => ({ ...state, title: event.target.value }))}
                    placeholder={"Ex.: reuni\u00e3o de lideran\u00e7as"}
                  />
                  <p className="field-help">Use pelo menos 3 caracteres.</p>
                </div>

                <div>
                  <label className="field-label" htmlFor="event-location">
                    Local (opcional)
                  </label>
                  <input
                    id="event-location"
                    className="field-input"
                    value={newEvent.location}
                    onChange={(event) => setNewEvent((state) => ({ ...state, location: event.target.value }))}
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="event-description">
                    {"Descri\u00e7\u00e3o (opcional)"}
                  </label>
                  <textarea
                    id="event-description"
                    className="field-textarea"
                    value={newEvent.description}
                    onChange={(event) => setNewEvent((state) => ({ ...state, description: event.target.value }))}
                  />
                </div>
              </div>

              <div className="actions-row" style={{ justifyContent: "flex-end", marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveEvent}
                  disabled={newEvent.title.trim().length < 3}
                >
                  Salvar evento
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
