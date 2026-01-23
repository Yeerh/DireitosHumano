import { useMemo, useState } from "react";
import { addDenuncia, loadDenuncias } from "@/lib/denuncias.storage";
import type { Denuncia, DenunciaCategoria, DenunciaTipo } from "@/lib/denuncias";

const categorias: DenunciaCategoria[] = [
  "Discriminação / Intolerância religiosa",
  "Vandalismo / Dano ao patrimônio",
  "Ameaça / Assédio",
  "Conflito de vizinhança",
  "Outros",
];

function uid() {
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString();
}

export default function Denuncias() {
  const [refresh, setRefresh] = useState(0);
  const data = useMemo(() => loadDenuncias(), [refresh]);

  const [form, setForm] = useState({
    tipo: "Denúncia" as DenunciaTipo,
    categoria: categorias[0],
    titulo: "",
    mensagem: "",
    localOcorrido: "",
    anonimo: true,
    nome: "",
    telefone: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ok, setOk] = useState<string | null>(null);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.titulo.trim()) e.titulo = "Informe um título.";
    if (form.titulo.trim().length < 5) e.titulo = "Título muito curto (mín. 5 caracteres).";
    if (!form.mensagem.trim()) e.mensagem = "Descreva a ocorrência/sugestão.";
    if (form.mensagem.trim().length < 20) e.mensagem = "Mensagem muito curta (mín. 20 caracteres).";

    if (!form.anonimo) {
      if (!form.nome.trim()) e.nome = "Informe seu nome ou marque como anônimo.";
      if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Informe um e-mail válido.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setOk(null);

    if (!validate()) return;

    const item: Denuncia = {
      id: uid(),
      tipo: form.tipo,
      categoria: form.categoria,
      titulo: form.titulo.trim(),
      mensagem: form.mensagem.trim(),
      localOcorrido: form.localOcorrido.trim() ? form.localOcorrido.trim() : undefined,
      anonimo: form.anonimo,
      nome: form.anonimo ? undefined : form.nome.trim(),
      telefone: form.anonimo ? undefined : (form.telefone.trim() || undefined),
      email: form.anonimo ? undefined : form.email.trim(),
      createdAt: new Date().toISOString(),
      status: "Recebido",
    };

    addDenuncia(item);
    setOk("Registro enviado com sucesso. Status: Recebido.");
    setForm((s) => ({
      ...s,
      titulo: "",
      mensagem: "",
      localOcorrido: "",
      nome: "",
      telefone: "",
      email: "",
      anonimo: true,
      tipo: "Denúncia",
      categoria: categorias[0],
    }));
    setRefresh((x) => x + 1);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Denúncias & Sugestões</h2>
        <p className="mt-1 text-sm text-slate-600">
          Canal para registrar ocorrências e propostas de melhoria relacionadas ao mapeamento.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-800">Tipo</label>
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
                value={form.tipo}
                onChange={(e) => setForm((s) => ({ ...s, tipo: e.target.value as DenunciaTipo }))}
              >
                <option>Denúncia</option>
                <option>Sugestão</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800">Categoria</label>
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
                value={form.categoria}
                onChange={(e) => setForm((s) => ({ ...s, categoria: e.target.value as DenunciaCategoria }))}
              >
                {categorias.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-800">Título</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
              value={form.titulo}
              onChange={(e) => setForm((s) => ({ ...s, titulo: e.target.value }))}
              placeholder="Ex.: Ocorrência no entorno / Solicitação de melhoria"
            />
            {errors.titulo && <p className="mt-1 text-xs text-red-600">{errors.titulo}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-800">Descrição</label>
            <textarea
              className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
              value={form.mensagem}
              onChange={(e) => setForm((s) => ({ ...s, mensagem: e.target.value }))}
              placeholder="Descreva com clareza o que ocorreu ou o que está sugerindo."
            />
            {errors.mensagem && <p className="mt-1 text-xs text-red-600">{errors.mensagem}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-800">Local (opcional)</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
              value={form.localOcorrido}
              onChange={(e) => setForm((s) => ({ ...s, localOcorrido: e.target.value }))}
              placeholder="Rua, bairro, ponto de referência..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="anonimo"
              type="checkbox"
              checked={form.anonimo}
              onChange={(e) => setForm((s) => ({ ...s, anonimo: e.target.checked }))}
            />
            <label htmlFor="anonimo" className="text-sm font-semibold text-slate-800">
              Enviar como anônimo
            </label>
          </div>

          {!form.anonimo && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label className="text-sm font-semibold text-slate-800">Nome</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
                  value={form.nome}
                  onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))}
                />
                {errors.nome && <p className="mt-1 text-xs text-red-600">{errors.nome}</p>}
              </div>

              <div className="sm:col-span-1">
                <label className="text-sm font-semibold text-slate-800">Telefone (opcional)</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
                  value={form.telefone}
                  onChange={(e) => setForm((s) => ({ ...s, telefone: e.target.value }))}
                  placeholder="(81) 9xxxx-xxxx"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="text-sm font-semibold text-slate-800">E-mail</label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
            </div>
          )}

          {ok && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {ok}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-[#1b4c7d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163e66] focus:outline-none focus:ring-4 focus:ring-[#1b4c7d]/25"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Registros enviados (local)</h3>
        <p className="mt-1 text-xs text-slate-600">
          Esta lista é apenas para demonstração (localStorage). Em produção, isso iria para um backend.
        </p>

        {data.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">Nenhum registro ainda.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {data.slice(0, 6).map((d) => (
              <div key={d.id} className="rounded-xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-slate-900">{d.titulo}</div>
                  <div className="text-xs text-slate-600">{d.status}</div>
                </div>
                <div className="mt-1 text-xs text-slate-600">{d.tipo} • {d.categoria}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
