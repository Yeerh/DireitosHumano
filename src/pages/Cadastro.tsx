import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RacaCor, Segmento, Terreiro } from "@/types/terreiro";
import { addTerreiro } from "@/services/storage";

const segmentos: Segmento[] = ["Candomblé", "Umbanda", "Jurema", "Culto tradicional Iorubá"];
const racas: RacaCor[] = ["Preto", "Branco", "Pardo", "Amarelo", "Indígena"];

function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

export default function Cadastro() {
  const nav = useNavigate();

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [form, setForm] = useState({
    nomeCasa: "",
    anoFundacao: String(currentYear),
    segmento: "Candomblé" as Segmento,
    qtdFilhosSanto: "0",
    endereco: "",
    liderReligioso: "",
    telefone: "",
    email: "",
    racaCor: "Preto" as RacaCor,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    const ano = Number(form.anoFundacao);
    const qtd = Number(form.qtdFilhosSanto);

    if (!form.nomeCasa.trim()) e.nomeCasa = "Informe o nome da casa de axé.";
    if (!Number.isFinite(ano) || ano < 1600 || ano > currentYear) {
      e.anoFundacao = `Ano inválido. Use entre 1600 e ${currentYear}.`;
    }
    if (!Number.isFinite(qtd) || qtd < 0 || qtd > 99999) {
      e.qtdFilhosSanto = "Quantidade inválida.";
    }
    if (!form.endereco.trim()) e.endereco = "Informe o endereço.";
    if (!form.liderReligioso.trim()) e.liderReligioso = "Informe o líder religioso.";
    if (!form.telefone.trim() || onlyDigits(form.telefone).length < 8) {
      e.telefone = "Informe um telefone válido.";
    }
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = "Informe um e-mail válido.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload: Terreiro = {
      id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString(),
      nomeCasa: form.nomeCasa.trim(),
      anoFundacao: Number(form.anoFundacao),
      segmento: form.segmento,
      qtdFilhosSanto: Number(form.qtdFilhosSanto),
      endereco: form.endereco.trim(),
      liderReligioso: form.liderReligioso.trim(),
      telefone: form.telefone.trim(),
      email: form.email.trim(),
      racaCor: form.racaCor,
      createdAt: new Date().toISOString(),
    };

    addTerreiro(payload);
    nav(`/detalhes/${payload.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Novo cadastro</h2>
        <p className="mt-1 text-sm text-slate-600">
          Preencha os dados para registrar uma casa de axé no mapeamento.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          {/* Nome */}
          <div>
            <label className="text-sm font-medium text-slate-800">Nome da casa de Axé</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
              value={form.nomeCasa}
              onChange={(ev) => setForm((s) => ({ ...s, nomeCasa: ev.target.value }))}
              placeholder="Ex.: Ilê Axé ..."
            />
            {errors.nomeCasa && <p className="mt-1 text-xs text-red-600">{errors.nomeCasa}</p>}
          </div>

          {/* Ano + Qtd */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-800">Ano de fundação</label>
              <input
                type="number"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
                value={form.anoFundacao}
                onChange={(ev) => setForm((s) => ({ ...s, anoFundacao: ev.target.value }))}
              />
              {errors.anoFundacao && <p className="mt-1 text-xs text-red-600">{errors.anoFundacao}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-800">
                Quantidade de filhos/filhas de santo
              </label>
              <input
                type="number"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
                value={form.qtdFilhosSanto}
                onChange={(ev) => setForm((s) => ({ ...s, qtdFilhosSanto: ev.target.value }))}
                min={0}
              />
              {errors.qtdFilhosSanto && (
                <p className="mt-1 text-xs text-red-600">{errors.qtdFilhosSanto}</p>
              )}
            </div>
          </div>

          {/* Segmento */}
          <div>
            <label className="text-sm font-medium text-slate-800">Qual segmento?</label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {segmentos.map((seg) => (
                <label
                  key={seg}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <input
                    type="radio"
                    name="segmento"
                    checked={form.segmento === seg}
                    onChange={() => setForm((s) => ({ ...s, segmento: seg }))}
                  />
                  <span className="text-sm text-slate-800">{seg}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Endereço */}
          <div>
            <label className="text-sm font-medium text-slate-800">Endereço</label>
            <textarea
              className="mt-2 min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
              value={form.endereco}
              onChange={(ev) => setForm((s) => ({ ...s, endereco: ev.target.value }))}
              placeholder="Rua, número, bairro, cidade/UF"
            />
            {errors.endereco && <p className="mt-1 text-xs text-red-600">{errors.endereco}</p>}
          </div>

          {/* Líder */}
          <div>
            <label className="text-sm font-medium text-slate-800">Nome do líder religioso</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
              value={form.liderReligioso}
              onChange={(ev) => setForm((s) => ({ ...s, liderReligioso: ev.target.value }))}
              placeholder="Nome completo"
            />
            {errors.liderReligioso && (
              <p className="mt-1 text-xs text-red-600">{errors.liderReligioso}</p>
            )}
          </div>

          {/* Contato */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-800">Telefone</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
                value={form.telefone}
                onChange={(ev) => setForm((s) => ({ ...s, telefone: ev.target.value }))}
                placeholder="(81) 9xxxx-xxxx"
              />
              {errors.telefone && <p className="mt-1 text-xs text-red-600">{errors.telefone}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-800">E-mail</label>
              <input
                type="email"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
                value={form.email}
                onChange={(ev) => setForm((s) => ({ ...s, email: ev.target.value }))}
                placeholder="contato@..."
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
          </div>

          {/* Raça/cor */}
          <div>
            <label className="text-sm font-medium text-slate-800">Raça/cor</label>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {racas.map((r) => (
                <label
                  key={r}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <input
                    type="radio"
                    name="racaCor"
                    checked={form.racaCor === r}
                    onChange={() => setForm((s) => ({ ...s, racaCor: r }))}
                  />
                  <span className="text-sm text-slate-800">{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => nav("/")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[#1b4c7d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163e66] focus:outline-none focus:ring-4 focus:ring-[#1b4c7d]/25"
            >
              Salvar cadastro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
