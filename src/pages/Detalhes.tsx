import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteTerreiroById, getTerreiroById } from "@/services/storage";
import { loadVinculosByTerreiroId } from "@/services/vinculos";

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("pt-BR");
}

export default function Detalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const item = useMemo(() => (id ? getTerreiroById(id) : null), [id]);
  const vinculos = useMemo(() => (id ? loadVinculosByTerreiroId(id) : []), [id]);

  if (!item) {
    return (
      <section className="panel">
        <div className="panel-body">
          <h2 className="page-title">{"Registro n\u00e3o encontrado"}</h2>
          <p className="page-subtitle">
            {"N\u00e3o foi poss\u00edvel localizar o cadastro solicitado. Volte para a listagem principal."}
          </p>
          <div className="actions-row" style={{ marginTop: "1rem" }}>
            <Link to="/" className="btn btn-primary">
              {"Voltar para in\u00edcio"}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="split-grid">
      <section className="panel">
        <div className="panel-body">
          <div className="panel-head">
            <div>
              <h2 className="page-title">{item.nomeCasa}</h2>
              <p className="page-subtitle">
                Criado em {formatDateTime(item.createdAt)} | ID:{" "}
                <span className="font-mono text-xs">{item.id}</span>
              </p>
            </div>

            <div className="actions-row">
              <Link to="/" className="btn btn-secondary">
                Voltar
              </Link>
              <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
                Excluir cadastro
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-body">
          <h3 className="page-title" style={{ fontSize: "1.2rem" }}>
            Dados cadastrados
          </h3>

          <dl className="grid gap-3 sm:grid-cols-2" style={{ marginTop: "0.9rem" }}>
            <div className="event-card">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Segmento</dt>
              <dd className="mt-1 text-sm font-bold text-slate-900">{item.segmento}</dd>
            </div>

            <div className="event-card">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {"Ano de funda\u00e7\u00e3o"}
              </dt>
              <dd className="mt-1 text-sm font-bold text-slate-900">{item.anoFundacao}</dd>
            </div>

            <div className="event-card">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filhos de santo</dt>
              <dd className="mt-1 text-sm font-bold text-slate-900">{item.qtdFilhosSanto}</dd>
            </div>

            <div className="event-card">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{"Ra\u00e7a/cor"}</dt>
              <dd className="mt-1 text-sm font-bold text-slate-900">{item.racaCor}</dd>
            </div>

            <div className="event-card sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{"Endere\u00e7o"}</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm font-bold text-slate-900">{item.endereco}</dd>
            </div>

            <div className="event-card">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {"L\u00edder religioso"}
              </dt>
              <dd className="mt-1 text-sm font-bold text-slate-900">{item.liderReligioso}</dd>
            </div>

            <div className="event-card">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Telefone</dt>
              <dd className="mt-1 text-sm font-bold text-slate-900">{item.telefone}</dd>
            </div>

            <div className="event-card sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">E-mail</dt>
              <dd className="mt-1 text-sm font-bold text-slate-900">{item.email}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="panel">
        <div className="panel-body">
          <h3 className="page-title" style={{ fontSize: "1.2rem" }}>
            Quem faz parte
          </h3>
          <p className="page-subtitle">Pessoas vinculadas a este terreiro.</p>

          {vinculos.length === 0 ? (
            <p className="page-subtitle" style={{ marginTop: "0.9rem" }}>
              Nenhum v\u00ednculo registrado at\u00e9 o momento.
            </p>
          ) : (
            <div className="event-list">
              {vinculos.map((vinculo) => (
                <article key={vinculo.id} className="event-card">
                  <p className="m-0 text-sm font-bold text-slate-900">{vinculo.nomePessoa}</p>
                  <p className="mt-1 text-xs text-slate-600">CPF: {vinculo.cpf}</p>
                  <p className="mt-1 text-xs text-slate-600">E-mail: {vinculo.email}</p>
                  <p className="mt-1 text-xs text-slate-600">N\u00famero: {vinculo.numero}</p>
                  {vinculo.funcao ? <p className="mt-1 text-xs text-slate-600">Fun\u00e7\u00e3o: {vinculo.funcao}</p> : null}
                  <p className="mt-1 text-xs text-slate-500">Registrado em {formatDateTime(vinculo.createdAt)}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {confirmDelete ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="panel-body">
              <h4 className="page-title" style={{ fontSize: "1.12rem" }}>
                {"Confirmar exclus\u00e3o"}
              </h4>
              <p className="page-subtitle">
                {"Deseja realmente excluir o cadastro de "}
                <strong>{item.nomeCasa}</strong>
                {"? Esta a\u00e7\u00e3o n\u00e3o pode ser desfeita."}
              </p>

              <div className="actions-row" style={{ justifyContent: "flex-end", marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    deleteTerreiroById(item.id);
                    navigate("/");
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
