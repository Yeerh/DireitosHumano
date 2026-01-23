import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteTerreiroById, getTerreiroById } from "@/services/storage";

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

export default function Detalhes() {
  const { id } = useParams();
  const nav = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const item = useMemo(() => (id ? getTerreiroById(id) : null), [id]);

  if (!item) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Registro não encontrado</h2>
        <p className="mt-2 text-sm text-slate-600">
          Não foi possível localizar este registro. Verifique a lista.
        </p>
        <div className="mt-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#1b4c7d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163e66]"
          >
            Voltar para Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{item.nomeCasa}</h2>
            <p className="mt-1 text-sm text-slate-600">
              Criado em {formatDateTime(item.createdAt)} • ID:{" "}
              <span className="font-mono text-xs">{item.id}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Voltar
            </Link>

            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-600/25"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Dados do cadastro</h3>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs text-slate-500">Segmento</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{item.segmento}</dd>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs text-slate-500">Ano de fundação</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{item.anoFundacao}</dd>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs text-slate-500">Filhos/filhas de santo</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{item.qtdFilhosSanto}</dd>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs text-slate-500">Raça/cor</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{item.racaCor}</dd>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
            <dt className="text-xs text-slate-500">Endereço</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900 whitespace-pre-wrap">
              {item.endereco}
            </dd>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs text-slate-500">Líder religioso</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{item.liderReligioso}</dd>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs text-slate-500">Telefone</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{item.telefone}</dd>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
            <dt className="text-xs text-slate-500">E-mail</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{item.email}</dd>
          </div>
        </dl>
      </div>

      {/* Modal confirmação */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h4 className="text-base font-semibold text-slate-900">Confirmar exclusão</h4>
            <p className="mt-2 text-sm text-slate-600">
              Deseja excluir o registro <strong>{item.nomeCasa}</strong>? Esta ação não pode ser desfeita.
            </p>

            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={() => setConfirming(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteTerreiroById(item.id);
                  nav("/");
                }}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
