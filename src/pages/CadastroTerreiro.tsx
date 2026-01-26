import { useMemo, useState } from "react";
import { saveTerreiro, loadTerreiros } from "@/lib/terreiro.storage";
import type { Segmento, Terreiro } from "@/lib/terreiro.types";
import { getActiveTriagemId } from "@/lib/triagem.storage";

function uid() {
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString();
}

const segmentos: Segmento[] = ["Umbanda", "Candomblé", "Jurema", "Culto tradicional Iorubá", "Outro"];

export default function CadastroTerreiro() {
  const triagemId = getActiveTriagemId();

  const [refresh, setRefresh] = useState(0);
  const data = useMemo(() => loadTerreiros(), [refresh]);

  const [form, setForm] = useState({
    nomeCasa: "",
    anoFundacao: "",
    segmento: "Umbanda" as Segmento,
    segmentoOutro: "",
    qtdFilhosSanto: 0,
    endereco: "",
    liderReligioso: "",
    telefone: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ok, setOk] = useState<string | null>(null);

  function validate() {
    const e: Record<string, string> = {};
    if (!triagemId) e.triagemId = "Triagem não encontrada. Refaça o questionário.";

    if (!form.nomeCasa.trim()) e.nomeCasa = "Informe o nome do Terreiro.";
    if (!form.anoFundacao.trim() || form.anoFundacao.trim().length !== 4) e.anoFundacao = "Informe o ano (4 dígitos).";

    if (form.segmento === "Outro" && !form.segmentoOutro.trim()) e.segmentoOutro = "Descreva o segmento (Outro).";

    if (Number.isNaN(Number(form.qtdFilhosSanto)) || Number(form.qtdFilhosSanto) < 0) e.qtdFilhosSanto = "Quantidade inválida.";
    if (!form.endereco.trim()) e.endereco = "Informe o endereço.";
    if (!form.liderReligioso.trim()) e.liderReligioso = "Informe o líder religioso.";

    if (!form.telefone.trim() || form.telefone.replace(/\D/g, "").length < 10) e.telefone = "Informe telefone com DDD.";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Informe um e-mail válido.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setOk(null);

    if (!validate()) return;

    const item: Terreiro = {
      id: uid(),
      createdAt: new Date().toISOString(),
      triagemId: triagemId!,

      nomeCasa: form.nomeCasa.trim(),
      anoFundacao: form.anoFundacao.trim(),
      segmento: form.segmento,
      segmentoOutro: form.segmento === "Outro" ? form.segmentoOutro.trim() : undefined,

      qtdFilhosSanto: Number(form.qtdFilhosSanto),
      endereco: form.endereco.trim(),
      liderReligioso: form.liderReligioso.trim(),
      telefone: form.telefone.trim(),
      email: form.email.trim(),
    };

    saveTerreiro(item);
    setOk("Terreiro cadastrado com sucesso.");
    setForm({
      nomeCasa: "",
      anoFundacao: "",
      segmento: "Umbanda",
      segmentoOutro: "",
      qtdFilhosSanto: 0,
      endereco: "",
      liderReligioso: "",
      telefone: "",
      email: "",
    });
    setRefresh((x) => x + 1);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <h2 className="h2">Cadastro de Terreiro (Umbanda)</h2>
        <p className="muted mt-1">
          Registre informações institucionais do Terreiro para fins de mapeamento e organização de políticas públicas.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {errors.triagemId && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.triagemId}
            </div>
          )}

          <div>
            <label className="label">Nome da casa de Axé *</label>
            <input className="input" value={form.nomeCasa} onChange={(e) => setForm((s) => ({ ...s, nomeCasa: e.target.value }))} />
            {errors.nomeCasa && <p className="mt-1 text-xs text-red-600">{errors.nomeCasa}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Ano em que foi fundado *</label>
              <input
                className="input"
                value={form.anoFundacao}
                onChange={(e) => setForm((s) => ({ ...s, anoFundacao: e.target.value }))}
                placeholder="Ex.: 2008"
              />
              {errors.anoFundacao && <p className="mt-1 text-xs text-red-600">{errors.anoFundacao}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="label">Segmento *</label>
              <select
                className="input"
                value={form.segmento}
                onChange={(e) => setForm((s) => ({ ...s, segmento: e.target.value as Segmento }))}
              >
                {segmentos.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {form.segmento === "Outro" && (
                <div className="mt-2">
                  <input
                    className="input"
                    placeholder="Descreva o segmento..."
                    value={form.segmentoOutro}
                    onChange={(e) => setForm((s) => ({ ...s, segmentoOutro: e.target.value }))}
                  />
                  {errors.segmentoOutro && <p className="mt-1 text-xs text-red-600">{errors.segmentoOutro}</p>}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="label">Quantidade de filhos/filhas de santo</label>
            <input
              className="input"
              type="number"
              value={form.qtdFilhosSanto}
              onChange={(e) => setForm((s) => ({ ...s, qtdFilhosSanto: Number(e.target.value) }))}
            />
            {errors.qtdFilhosSanto && <p className="mt-1 text-xs text-red-600">{errors.qtdFilhosSanto}</p>}
          </div>

          <div>
            <label className="label">Endereço *</label>
            <input className="input" value={form.endereco} onChange={(e) => setForm((s) => ({ ...s, endereco: e.target.value }))} />
            {errors.endereco && <p className="mt-1 text-xs text-red-600">{errors.endereco}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nome do líder religioso *</label>
              <input className="input" value={form.liderReligioso} onChange={(e) => setForm((s) => ({ ...s, liderReligioso: e.target.value }))} />
              {errors.liderReligioso && <p className="mt-1 text-xs text-red-600">{errors.liderReligioso}</p>}
            </div>

            <div>
              <label className="label">Telefone para contato *</label>
              <input className="input" value={form.telefone} onChange={(e) => setForm((s) => ({ ...s, telefone: e.target.value }))} />
              {errors.telefone && <p className="mt-1 text-xs text-red-600">{errors.telefone}</p>}
            </div>
          </div>

          <div>
            <label className="label">E-mail *</label>
            <input className="input" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          {ok && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {ok}
            </div>
          )}

          <div className="flex justify-end">
            <button
              className="rounded-xl bg-[#1b4c7d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163e66]"
              type="submit"
            >
              Cadastrar Terreiro
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <h3 className="h3">Cadastros locais (demonstração)</h3>
        <p className="muted mt-1">
          Lista limitada (localStorage). Em produção, seria integrado ao backend.
        </p>

        {data.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">Nenhum terreiro cadastrado ainda.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {data.slice(0, 8).map((t) => (
              <div key={t.id} className="rounded-xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-slate-900">{t.nomeCasa}</div>
                  <div className="text-xs text-slate-600">{t.segmento}</div>
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Líder: {t.liderReligioso} • Fundação: {t.anoFundacao}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
