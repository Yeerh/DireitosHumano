import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadTerreiros } from "@/services/storage";
import type { Terreiro } from "@/lib/types";

import type { CalendarEvent } from "@/lib/calendar.types";
import { addEvent, deleteEvent, loadEvents } from "@/lib/calendar.storage";

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

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function weekdayMon0(date: Date) {
  // retorna 0..6 com segunda=0
  const js = date.getDay(); // domingo=0
  return (js + 6) % 7;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [refresh, setRefresh] = useState(0);

  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState(() => toYMD(new Date()));
  const [modal, setModal] = useState(false);

  const [newEv, setNewEv] = useState({
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
    return terreiros.filter((t) => {
      const blob = [t.nomeCasa, t.liderReligioso, t.endereco, t.segmento, t.email, t.telefone, t.racaCor]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [terreiros, query]);

  const monthDays = useMemo(() => {
    const s = startOfMonth(month);
    const e = endOfMonth(month);
    const days: { ymd: string; day: number; inMonth: boolean }[] = [];

    const leading = weekdayMon0(s); // quantos dias antes do 1º (segunda-based)
    for (let i = 0; i < leading; i++) {
      const d = new Date(s);
      d.setDate(s.getDate() - (leading - i));
      days.push({ ymd: toYMD(d), day: d.getDate(), inMonth: false });
    }

    for (let d = 1; d <= e.getDate(); d++) {
      const cur = new Date(month.getFullYear(), month.getMonth(), d);
      days.push({ ymd: toYMD(cur), day: d, inMonth: true });
    }

    while (days.length % 7 !== 0) {
      const last = new Date(month.getFullYear(), month.getMonth(), e.getDate());
      last.setDate(last.getDate() + (days.length % 7 === 0 ? 0 : (7 - (days.length % 7))));
      // Ajuste mais seguro: adiciona um por vez até fechar
      const prev = new Date(month.getFullYear(), month.getMonth(), e.getDate());
      prev.setDate(e.getDate() + (days.length - (leading + e.getDate()) + 1));
      days.push({ ymd: toYMD(prev), day: prev.getDate(), inMonth: false });
    }

    return days;
  }, [month]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const list = map.get(ev.date) ?? [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return map;
  }, [events]);

  const selectedEvents = useMemo(() => eventsByDate.get(selected) ?? [], [eventsByDate, selected]);

  function prevMonth() {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }
  function nextMonth() {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  function openAddEvent(date?: string) {
    const dt = date ?? selected;
    setNewEv({ date: dt, title: "", description: "", location: "" });
    setModal(true);
  }

  function saveEvent() {
    if (newEv.title.trim().length < 3) return;

    addEvent({
      id: uid(),
      date: newEv.date,
      title: newEv.title.trim(),
      description: newEv.description.trim() || undefined,
      location: newEv.location.trim() || undefined,
      createdAt: new Date().toISOString(),
    });

    setModal(false);
    setRefresh((x) => x + 1);
  }

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Registros cadastrados</h2>
            <p className="mt-1 text-sm text-slate-600">
              Consulte, pesquise e acesse os detalhes. Use o calendário para eventos e ações.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to="/cadastro"
              className="inline-flex items-center justify-center rounded-xl bg-[#1b4c7d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163e66] focus:outline-none focus:ring-4 focus:ring-[#1b4c7d]/25"
            >
              Novo cadastro
            </Link>

            <button
              type="button"
              onClick={() => openAddEvent()}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Adicionar evento
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
            placeholder="Buscar por nome, líder, endereço, segmento..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setRefresh((s) => s + 1)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Atualizar dados
          </button>
        </div>
      </div>

      {/* Calendário + Eventos do dia */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Calendário */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={prevMonth}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              ←
            </button>

            <div className="text-sm font-semibold text-slate-900 capitalize">{monthLabel(month)}</div>

            <button
              onClick={nextMonth}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              →
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-slate-500">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
              <div key={d} className="px-1">{d}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {monthDays.map((d) => {
              const has = (eventsByDate.get(d.ymd)?.length ?? 0) > 0;
              const isSel = d.ymd === selected;

              return (
                <button
                  key={d.ymd}
                  type="button"
                  onClick={() => setSelected(d.ymd)}
                  className={[
                    "rounded-xl border px-2 py-2 text-left transition",
                    d.inMonth ? "border-slate-200 bg-white hover:bg-slate-50" : "border-slate-100 bg-slate-50 text-slate-400",
                    isSel ? "ring-4 ring-[#1b4c7d]/20 border-[#1b4c7d]/30" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-800">{d.day}</div>
                    {has && <span className="h-2 w-2 rounded-full bg-[#1b4c7d]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => openAddEvent(selected)}
              className="rounded-xl bg-[#1b4c7d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163e66]"
            >
              Evento para {selected}
            </button>
          </div>
        </div>

        {/* Eventos do dia selecionado */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Eventos do dia</h3>
            <span className="text-xs text-slate-600">{selected}</span>
          </div>

          {selectedEvents.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">Nenhum evento para este dia.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {selectedEvents.map((ev) => (
                <div key={ev.id} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{ev.title}</div>
                      {ev.location && <div className="text-xs text-slate-600">{ev.location}</div>}
                      {ev.description && <div className="mt-1 text-xs text-slate-600">{ev.description}</div>}
                    </div>

                    <button
                      onClick={() => {
                        deleteEvent(ev.id);
                        setRefresh((x) => x + 1);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabela de registros */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {filtered.length === 0 ? (
          <div className="text-sm text-slate-600">
            Nenhum registro encontrado. Clique em <strong>Novo cadastro</strong> para iniciar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="px-3">Casa de Axé</th>
                  <th className="px-3">Segmento</th>
                  <th className="px-3">Líder</th>
                  <th className="px-3">Fundação</th>
                  <th className="px-3">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((t: Terreiro) => (
                  <tr key={t.id} className="rounded-xl bg-slate-50">
                    <td className="px-3 py-3 font-semibold text-slate-900">{t.nomeCasa}</td>
                    <td className="px-3 py-3 text-sm text-slate-700">{t.segmento}</td>
                    <td className="px-3 py-3 text-sm text-slate-700">{t.liderReligioso}</td>
                    <td className="px-3 py-3 text-sm text-slate-700">{t.anoFundacao}</td>
                    <td className="px-3 py-3">
                      <Link
                        to={`/detalhes/${t.id}`}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                      >
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

      {/* Modal Adicionar Evento */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
            <h4 className="text-base font-semibold text-slate-900">Adicionar evento</h4>

            <div className="mt-4 grid gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-800">Data</label>
                <input
                  type="date"
                  value={newEv.date}
                  onChange={(e) => setNewEv((s) => ({ ...s, date: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">Título</label>
                <input
                  value={newEv.title}
                  onChange={(e) => setNewEv((s) => ({ ...s, title: e.target.value }))}
                  placeholder="Ex.: Ação de cadastramento / Reunião comunitária"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
                />
                <p className="mt-1 text-xs text-slate-500">Mínimo 3 caracteres.</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">Local (opcional)</label>
                <input
                  value={newEv.location}
                  onChange={(e) => setNewEv((s) => ({ ...s, location: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">Descrição (opcional)</label>
                <textarea
                  value={newEv.description}
                  onChange={(e) => setNewEv((s) => ({ ...s, description: e.target.value }))}
                  className="mt-2 min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveEvent}
                className="rounded-xl bg-[#1b4c7d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163e66]"
                disabled={newEv.title.trim().length < 3}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
