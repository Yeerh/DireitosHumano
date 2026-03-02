import { useMemo, useState, type FormEvent } from "react";
import { addDenuncia, loadDenuncias } from "@/lib/denuncias.storage";
import type { Denuncia, DenunciaCategoria, DenunciaTipo } from "@/lib/denuncias";

const categorias: DenunciaCategoria[] = [
  "Discrimina\u00e7\u00e3o / Intoler\u00e2ncia religiosa",
  "Vandalismo / Dano ao patrim\u00f4nio",
  "Amea\u00e7a / Ass\u00e9dio",
  "Conflito de vizinhan\u00e7a",
  "Outros",
];

function uid() {
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString();
}

export default function Denuncias() {
  const [refresh, setRefresh] = useState(0);
  const registros = useMemo(() => loadDenuncias(), [refresh]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    tipo: "Den\u00fancia" as DenunciaTipo,
    categoria: categorias[0],
    titulo: "",
    mensagem: "",
    localOcorrido: "",
    anonimo: true,
    nome: "",
    telefone: "",
    email: "",
  });

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!form.titulo.trim()) nextErrors.titulo = "Informe um t\u00edtulo.";
    if (form.titulo.trim().length < 5) nextErrors.titulo = "T\u00edtulo curto demais (m\u00ednimo de 5 caracteres).";
    if (!form.mensagem.trim()) nextErrors.mensagem = "Descreva a ocorr\u00eancia ou sugest\u00e3o.";

    if (form.mensagem.trim().length < 20) {
      nextErrors.mensagem = "Mensagem curta demais (m\u00ednimo de 20 caracteres).";
    }

    if (!form.anonimo) {
      if (!form.nome.trim()) nextErrors.nome = "Informe seu nome ou marque envio an\u00f4nimo.";

      if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
        nextErrors.email = "Informe um e-mail v\u00e1lido.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);
    if (!validate()) return;

    const payload: Denuncia = {
      id: uid(),
      tipo: form.tipo,
      categoria: form.categoria,
      titulo: form.titulo.trim(),
      mensagem: form.mensagem.trim(),
      localOcorrido: form.localOcorrido.trim() || undefined,
      anonimo: form.anonimo,
      nome: form.anonimo ? undefined : form.nome.trim(),
      telefone: form.anonimo ? undefined : form.telefone.trim() || undefined,
      email: form.anonimo ? undefined : form.email.trim(),
      createdAt: new Date().toISOString(),
      status: "Recebido",
    };

    addDenuncia(payload);
    setSuccessMessage("Registro enviado com sucesso. Status inicial: Recebido.");
    setForm((state) => ({
      ...state,
      tipo: "Den\u00fancia",
      categoria: categorias[0],
      titulo: "",
      mensagem: "",
      localOcorrido: "",
      anonimo: true,
      nome: "",
      telefone: "",
      email: "",
    }));
    setRefresh((current) => current + 1);
  }

  return (
    <div className="split-grid">
      <section className="panel">
        <div className="panel-body">
          <div className="panel-head">
            <div>
              <h2 className="page-title">{"Canal de den\u00fancias e sugest\u00f5es"}</h2>
              <p className="page-subtitle">
                {"Registre ocorr\u00eancias, proponha melhorias e acompanhe os envios realizados localmente."}
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="field-group" style={{ marginTop: "1rem" }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="tipo">
                  Tipo
                </label>
                <select
                  id="tipo"
                  className="field-select"
                  value={form.tipo}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, tipo: event.target.value as DenunciaTipo }))
                  }
                >
                  <option>{"Den\u00fancia"}</option>
                  <option>{"Sugest\u00e3o"}</option>
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="categoria">
                  Categoria
                </label>
                <select
                  id="categoria"
                  className="field-select"
                  value={form.categoria}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, categoria: event.target.value as DenunciaCategoria }))
                  }
                >
                  {categorias.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="titulo">
                {"T\u00edtulo"}
              </label>
              <input
                id="titulo"
                className="field-input"
                value={form.titulo}
                onChange={(event) => setForm((state) => ({ ...state, titulo: event.target.value }))}
                placeholder={"Ex.: ocorr\u00eancia no entorno"}
              />
              {errors.titulo ? <p className="field-error">{errors.titulo}</p> : null}
            </div>

            <div>
              <label className="field-label" htmlFor="mensagem">
                {"Descri\u00e7\u00e3o"}
              </label>
              <textarea
                id="mensagem"
                className="field-textarea"
                value={form.mensagem}
                onChange={(event) => setForm((state) => ({ ...state, mensagem: event.target.value }))}
                placeholder="Detalhe o ocorrido ou a proposta de melhoria."
              />
              {errors.mensagem ? <p className="field-error">{errors.mensagem}</p> : null}
            </div>

            <div>
              <label className="field-label" htmlFor="localOcorrido">
                Local (opcional)
              </label>
              <input
                id="localOcorrido"
                className="field-input"
                value={form.localOcorrido}
                onChange={(event) => setForm((state) => ({ ...state, localOcorrido: event.target.value }))}
                placeholder={"Rua, bairro, refer\u00eancia"}
              />
            </div>

            <label className="radio-card" style={{ maxWidth: "340px" }}>
              <input
                id="anonimo"
                type="checkbox"
                checked={form.anonimo}
                onChange={(event) => setForm((state) => ({ ...state, anonimo: event.target.checked }))}
              />
              <span>Enviar anonimamente</span>
            </label>

            {!form.anonimo ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="field-label" htmlFor="nome">
                    Nome
                  </label>
                  <input
                    id="nome"
                    className="field-input"
                    value={form.nome}
                    onChange={(event) => setForm((state) => ({ ...state, nome: event.target.value }))}
                  />
                  {errors.nome ? <p className="field-error">{errors.nome}</p> : null}
                </div>

                <div>
                  <label className="field-label" htmlFor="telefone">
                    Telefone (opcional)
                  </label>
                  <input
                    id="telefone"
                    className="field-input"
                    value={form.telefone}
                    onChange={(event) => setForm((state) => ({ ...state, telefone: event.target.value }))}
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="email">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="field-input"
                    value={form.email}
                    onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
                  />
                  {errors.email ? <p className="field-error">{errors.email}</p> : null}
                </div>
              </div>
            ) : null}

            {successMessage ? <div className="status-ok">{successMessage}</div> : null}

            <div className="actions-row" style={{ justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary">
                Enviar registro
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="panel">
        <div className="panel-body">
          <h3 className="page-title" style={{ fontSize: "1.2rem" }}>
            {"\u00daltimos registros locais"}
          </h3>
          <p className="page-subtitle">
            {"Exibi\u00e7\u00e3o local (localStorage) para monitoramento r\u00e1pido."}
          </p>

          {registros.length === 0 ? (
            <p className="page-subtitle" style={{ marginTop: "0.9rem" }}>
              {"Nenhum registro enviado at\u00e9 o momento."}
            </p>
          ) : (
            <div className="event-list">
              {registros.slice(0, 8).map((registro) => (
                <article key={registro.id} className="event-card">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="m-0 text-sm font-bold text-slate-900">{registro.titulo}</p>
                    <span className="text-xs font-semibold text-slate-600">{registro.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {registro.tipo} - {registro.categoria}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(registro.createdAt).toLocaleString("pt-BR")}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
