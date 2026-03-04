import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/services/auth";
import { addTerreiro, loadTerreiros } from "@/services/storage";
import { addVinculo } from "@/services/vinculos";
import type { RacaCor, Segmento, Terreiro } from "@/types/terreiro";
import type { VinculoTerreiro } from "@/types/vinculo";

const segmentos: Segmento[] = [
  "Candombl\u00e9",
  "Umbanda",
  "Jurema",
  "Culto tradicional Iorub\u00e1",
];

const racas: RacaCor[] = ["Preto", "Branco", "Pardo", "Amarelo", "Ind\u00edgena"];

type CadastroTipo = "terreiro" | "vinculo";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export default function Cadastro() {
  const navigate = useNavigate();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const currentUser = useMemo(() => getCurrentUser(), []);
  const [refresh, setRefresh] = useState(0);
  const terreiros = useMemo(() => loadTerreiros(), [refresh]);
  const [cadastroTipo, setCadastroTipo] = useState<CadastroTipo>("terreiro");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [terreiroForm, setTerreiroForm] = useState({
    nomeCasa: "",
    anoFundacao: String(currentYear),
    segmento: "Candombl\u00e9" as Segmento,
    qtdFilhosSanto: "0",
    endereco: "",
    liderReligioso: "",
    telefone: "",
    email: "",
    racaCor: "Preto" as RacaCor,
  });

  const [vinculoForm, setVinculoForm] = useState({
    terreiroId: "",
    nomePessoa: currentUser?.nome ?? "",
    cpf: currentUser?.cpf ?? "",
    email: currentUser?.email ?? "",
    numero: currentUser?.numero ?? "",
    funcao: "",
  });

  const [terreiroErrors, setTerreiroErrors] = useState<Record<string, string>>({});
  const [vinculoErrors, setVinculoErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!vinculoForm.terreiroId && terreiros.length > 0) {
      setVinculoForm((state) => ({ ...state, terreiroId: terreiros[0].id }));
    }
  }, [terreiros, vinculoForm.terreiroId]);

  function validateTerreiro() {
    const nextErrors: Record<string, string> = {};
    const ano = Number(terreiroForm.anoFundacao);
    const quantidade = Number(terreiroForm.qtdFilhosSanto);

    if (!terreiroForm.nomeCasa.trim()) nextErrors.nomeCasa = "Informe o nome da casa.";

    if (!Number.isFinite(ano) || ano < 1600 || ano > currentYear) {
      nextErrors.anoFundacao = `Ano inv\u00e1lido. Use um valor entre 1600 e ${currentYear}.`;
    }

    if (!Number.isFinite(quantidade) || quantidade < 0 || quantidade > 99999) {
      nextErrors.qtdFilhosSanto = "Quantidade inv\u00e1lida.";
    }

    if (!terreiroForm.endereco.trim()) nextErrors.endereco = "Informe o endere\u00e7o.";
    if (!terreiroForm.liderReligioso.trim()) nextErrors.liderReligioso = "Informe o l\u00edder religioso.";

    if (!terreiroForm.telefone.trim() || onlyDigits(terreiroForm.telefone).length < 8) {
      nextErrors.telefone = "Informe um telefone v\u00e1lido.";
    }

    if (!terreiroForm.email.trim() || !/^\S+@\S+\.\S+$/.test(terreiroForm.email)) {
      nextErrors.email = "Informe um e-mail v\u00e1lido.";
    }

    setTerreiroErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateVinculo() {
    const nextErrors: Record<string, string> = {};

    if (!vinculoForm.terreiroId) {
      nextErrors.terreiroId = "Selecione um terreiro.";
    }

    if (vinculoForm.nomePessoa.trim().length < 3) {
      nextErrors.nomePessoa = "Informe o nome completo.";
    }

    if (onlyDigits(vinculoForm.cpf).length !== 11) {
      nextErrors.cpf = "Informe um CPF com 11 d\u00edgitos.";
    }

    if (!/^\S+@\S+\.\S+$/.test(vinculoForm.email)) {
      nextErrors.email = "Informe um e-mail v\u00e1lido.";
    }

    if (onlyDigits(vinculoForm.numero).length < 10) {
      nextErrors.numero = "Informe um n\u00famero v\u00e1lido.";
    }

    setVinculoErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function submitTerreiro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    if (!validateTerreiro()) return;

    const payload: Terreiro = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      nomeCasa: terreiroForm.nomeCasa.trim(),
      anoFundacao: Number(terreiroForm.anoFundacao),
      segmento: terreiroForm.segmento,
      qtdFilhosSanto: Number(terreiroForm.qtdFilhosSanto),
      endereco: terreiroForm.endereco.trim(),
      liderReligioso: terreiroForm.liderReligioso.trim(),
      telefone: terreiroForm.telefone.trim(),
      email: terreiroForm.email.trim(),
      racaCor: terreiroForm.racaCor,
      createdAt: new Date().toISOString(),
    };

    addTerreiro(payload);
    setVinculoForm((state) => ({ ...state, terreiroId: payload.id }));
    navigate(`/detalhes/${payload.id}`);
  }

  function submitVinculo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    if (!validateVinculo()) return;

    const payload: VinculoTerreiro = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      terreiroId: vinculoForm.terreiroId,
      nomePessoa: vinculoForm.nomePessoa.trim(),
      cpf: onlyDigits(vinculoForm.cpf),
      email: vinculoForm.email.trim().toLowerCase(),
      numero: vinculoForm.numero.trim(),
      funcao: vinculoForm.funcao.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    addVinculo(payload);
    setStatusMessage("V\u00ednculo registrado com sucesso.");
    setVinculoForm((state) => ({
      ...state,
      funcao: "",
    }));
    setVinculoErrors({});
    setRefresh((current) => current + 1);
  }

  return (
    <section className="panel">
      <div className="panel-body">
        <div className="panel-head">
          <div>
            <h2 className="page-title">Novo cadastro</h2>
            <p className="page-subtitle">
              Escolha se deseja registrar um novo local de terreiro ou informar quem faz parte de um terreiro j\u00e1
              cadastrado.
            </p>
          </div>
        </div>

        <div className="segmented-control" style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className={`segment-button${cadastroTipo === "terreiro" ? " active" : ""}`}
            onClick={() => {
              setStatusMessage(null);
              setCadastroTipo("terreiro");
            }}
          >
            Registrar local do terreiro
          </button>
          <button
            type="button"
            className={`segment-button${cadastroTipo === "vinculo" ? " active" : ""}`}
            onClick={() => {
              setStatusMessage(null);
              setCadastroTipo("vinculo");
            }}
          >
            Dizer de qual faz parte
          </button>
        </div>

        {statusMessage ? <div className="status-ok">{statusMessage}</div> : null}

        {cadastroTipo === "terreiro" ? (
          <form onSubmit={submitTerreiro} className="field-group" style={{ marginTop: "1rem" }}>
            <div>
              <label className="field-label" htmlFor="nomeCasa">
                Nome da casa
              </label>
              <input
                id="nomeCasa"
                className="field-input"
                value={terreiroForm.nomeCasa}
                onChange={(event) => setTerreiroForm((state) => ({ ...state, nomeCasa: event.target.value }))}
                placeholder={"Ex.: Il\u00ea Ax\u00e9..."}
              />
              {terreiroErrors.nomeCasa ? <p className="field-error">{terreiroErrors.nomeCasa}</p> : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="anoFundacao">
                  {"Ano de funda\u00e7\u00e3o"}
                </label>
                <input
                  id="anoFundacao"
                  type="number"
                  className="field-input"
                  value={terreiroForm.anoFundacao}
                  onChange={(event) => setTerreiroForm((state) => ({ ...state, anoFundacao: event.target.value }))}
                />
                {terreiroErrors.anoFundacao ? <p className="field-error">{terreiroErrors.anoFundacao}</p> : null}
              </div>

              <div>
                <label className="field-label" htmlFor="qtdFilhosSanto">
                  Quantidade de filhos/filhas de santo
                </label>
                <input
                  id="qtdFilhosSanto"
                  type="number"
                  min={0}
                  className="field-input"
                  value={terreiroForm.qtdFilhosSanto}
                  onChange={(event) => setTerreiroForm((state) => ({ ...state, qtdFilhosSanto: event.target.value }))}
                />
                {terreiroErrors.qtdFilhosSanto ? (
                  <p className="field-error">{terreiroErrors.qtdFilhosSanto}</p>
                ) : null}
              </div>
            </div>

            <div>
              <label className="field-label">Segmento</label>
              <div className="radio-grid">
                {segmentos.map((segmento) => (
                  <label key={segmento} className="radio-card">
                    <input
                      type="radio"
                      name="segmento"
                      checked={terreiroForm.segmento === segmento}
                      onChange={() => setTerreiroForm((state) => ({ ...state, segmento }))}
                    />
                    <span>{segmento}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="endereco">
                {"Endere\u00e7o"}
              </label>
              <textarea
                id="endereco"
                className="field-textarea"
                value={terreiroForm.endereco}
                onChange={(event) => setTerreiroForm((state) => ({ ...state, endereco: event.target.value }))}
                placeholder={"Rua, n\u00famero, bairro, cidade/UF"}
              />
              {terreiroErrors.endereco ? <p className="field-error">{terreiroErrors.endereco}</p> : null}
            </div>

            <div>
              <label className="field-label" htmlFor="liderReligioso">
                {"L\u00edder religioso"}
              </label>
              <input
                id="liderReligioso"
                className="field-input"
                value={terreiroForm.liderReligioso}
                onChange={(event) => setTerreiroForm((state) => ({ ...state, liderReligioso: event.target.value }))}
                placeholder="Nome completo"
              />
              {terreiroErrors.liderReligioso ? <p className="field-error">{terreiroErrors.liderReligioso}</p> : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="telefone">
                  Telefone
                </label>
                <input
                  id="telefone"
                  className="field-input"
                  value={terreiroForm.telefone}
                  onChange={(event) => setTerreiroForm((state) => ({ ...state, telefone: event.target.value }))}
                  placeholder="(81) 9xxxx-xxxx"
                />
                {terreiroErrors.telefone ? <p className="field-error">{terreiroErrors.telefone}</p> : null}
              </div>

              <div>
                <label className="field-label" htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  className="field-input"
                  value={terreiroForm.email}
                  onChange={(event) => setTerreiroForm((state) => ({ ...state, email: event.target.value }))}
                  placeholder="contato@exemplo.com"
                />
                {terreiroErrors.email ? <p className="field-error">{terreiroErrors.email}</p> : null}
              </div>
            </div>

            <div>
              <label className="field-label">{"Ra\u00e7a/cor"}</label>
              <div className="radio-grid">
                {racas.map((raca) => (
                  <label key={raca} className="radio-card">
                    <input
                      type="radio"
                      name="racaCor"
                      checked={terreiroForm.racaCor === raca}
                      onChange={() => setTerreiroForm((state) => ({ ...state, racaCor: raca }))}
                    />
                    <span>{raca}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="actions-row" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate("/")}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar local
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={submitVinculo} className="field-group" style={{ marginTop: "1rem" }}>
            {terreiros.length === 0 ? (
              <div className="status-warn">
                Cadastre primeiro o local do terreiro para depois vincular quem faz parte dele.
              </div>
            ) : null}

            <div>
              <label className="field-label" htmlFor="terreiroId">
                Terreiro
              </label>
              <select
                id="terreiroId"
                className="field-select"
                value={vinculoForm.terreiroId}
                onChange={(event) => setVinculoForm((state) => ({ ...state, terreiroId: event.target.value }))}
                disabled={terreiros.length === 0}
              >
                {terreiros.length === 0 ? <option value="">Nenhum terreiro cadastrado</option> : null}
                {terreiros.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nomeCasa}
                  </option>
                ))}
              </select>
              {vinculoErrors.terreiroId ? <p className="field-error">{vinculoErrors.terreiroId}</p> : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="nomePessoa">
                  Nome
                </label>
                <input
                  id="nomePessoa"
                  className="field-input"
                  value={vinculoForm.nomePessoa}
                  onChange={(event) => setVinculoForm((state) => ({ ...state, nomePessoa: event.target.value }))}
                />
                {vinculoErrors.nomePessoa ? <p className="field-error">{vinculoErrors.nomePessoa}</p> : null}
              </div>

              <div>
                <label className="field-label" htmlFor="cpf-vinculo">
                  CPF
                </label>
                <input
                  id="cpf-vinculo"
                  className="field-input"
                  value={vinculoForm.cpf}
                  onChange={(event) => setVinculoForm((state) => ({ ...state, cpf: event.target.value }))}
                />
                {vinculoErrors.cpf ? <p className="field-error">{vinculoErrors.cpf}</p> : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="email-vinculo">
                  E-mail
                </label>
                <input
                  id="email-vinculo"
                  type="email"
                  className="field-input"
                  value={vinculoForm.email}
                  onChange={(event) => setVinculoForm((state) => ({ ...state, email: event.target.value }))}
                />
                {vinculoErrors.email ? <p className="field-error">{vinculoErrors.email}</p> : null}
              </div>

              <div>
                <label className="field-label" htmlFor="numero-vinculo">
                Número de telefone
                </label>
                <input
                  id="numero-vinculo"
                  className="field-input"
                  value={vinculoForm.numero}
                  onChange={(event) => setVinculoForm((state) => ({ ...state, numero: event.target.value }))}
                />
                {vinculoErrors.numero ? <p className="field-error">{vinculoErrors.numero}</p> : null}
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="funcao">
                Fun\u00e7\u00e3o no terreiro (opcional)
              </label>
              <input
                id="funcao"
                className="field-input"
                value={vinculoForm.funcao}
                onChange={(event) => setVinculoForm((state) => ({ ...state, funcao: event.target.value }))}
                placeholder="Ex.: filho de santo, dirigente, colaborador"
              />
            </div>

            <div className="actions-row" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate("/")}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={terreiros.length === 0}>
                Salvar v\u00ednculo
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
