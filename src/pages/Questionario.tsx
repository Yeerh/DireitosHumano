import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setQuestionarioCompleto } from "@/lib/flow.storage";
import { saveTriagem } from "@/lib/triagem.storage";
import type {
  ComunidadeTradicional,
  DeficienciaTipo,
  IdentidadeGenero,
  OrientacaoSexual,
  RacaCor,
  RendaFamiliar,
  Moradia,
  Triagem,
} from "@/lib/triagem.types";

function uid() {
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString();
}

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

function validateCpf(cpf: string) {
  const c = onlyDigits(cpf);
  return c.length === 11; // MVP: valida tamanho; validação completa pode ser adicionada depois
}

const rendaOptions: RendaFamiliar[] = ["Menos de um salário", "De 1 a 3 salário", "Quatro salário", "Outro"];
const moradiaOptions: Moradia[] = ["Casa própria", "Casa alugada", "Moro com familiares", "Outro"];

const racaOptions: RacaCor[] = ["Preto", "Pardo", "Amarelo", "Indígena", "Branco", "Outro"];
const orientOptions: OrientacaoSexual[] = ["Heterossexual", "Homossexual", "Bissexualidade", "Pansexualidade", "Assexualidade", "Outro"];
const generoOptions: IdentidadeGenero[] = ["Cisgênero", "Transgênero", "Não Binário", "Intersexo", "Outro"];

const defOptions: DeficienciaTipo[] = ["Motora", "Física", "visual", "Auditiva", "Intelectual", "TEA", "Multiplas", "Fibromiogia", "Outro"];
const comOptions: ComunidadeTradicional[] = ["Quilombolas", "Terreiro", "Romani, Cigano", "Indígena", "Ribeirinho", "Outro"];

function ToggleList<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T[];
  onChange: (v: T[]) => void;
}) {
  function toggle(opt: T) {
    const has = value.includes(opt);
    onChange(has ? value.filter((x) => x !== opt) : [...value, opt]);
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <input type="checkbox" checked={value.includes(opt)} onChange={() => toggle(opt)} />
          <span className="text-sm font-semibold text-slate-800">{opt}</span>
        </label>
      ))}
    </div>
  );
}

export default function Questionario() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);

  const [f, setF] = useState({
    // 1/7
    nome: "",
    email: "",
    endereco: "",
    telefone: "",
    cpf: "",
    escolaridade: "",
    estadoCivil: "",

    // 2/7
    rendaFamiliar: "Menos de um salário" as RendaFamiliar,
    rendaOutro: "",
    cadastradoBeneficio: "Não" as "Sim" | "Não" | "Outro",
    beneficioOutro: "",
    beneficioQual: "",
    moradia: "Casa própria" as Moradia,
    moradiaOutro: "",

    // 3/7
    racaCor: [] as RacaCor[],
    racaCorOutro: "",
    orientacaoSexual: [] as OrientacaoSexual[],
    orientacaoOutro: "",
    identidadeGenero: [] as IdentidadeGenero[],
    generoOutro: "",
    pcd: "Não" as "Sim" | "Não",

    // 4/7
    pcdTipos: [] as DeficienciaTipo[],
    pcdOutro: "",
    idoso: "Não" as "Sim" | "Não",
    comunidadeTradicional: "Não" as "Sim" | "Não",
    comunidadeTipos: [] as ComunidadeTradicional[],
    comunidadeOutro: "",

    // 5/7
    qtdResidentes: 0,
    qtdCriancasAdolescentes: 0,
    criancasNomesDatas: "",
    qtdIdosos: 0,
    idososNomesDatas: "",
    qtdMulheres: 0,

    // 6/7
    mulheresNomesDatas: "",
    qtdPcdResidencia: 0,
    pcdNomesDatas: "",
    qtdDoencaRara: 0,
    qtdLgbtqia: 0,
    lgbtqiaNomesDatas: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const progressText = useMemo(() => `${step}/7`, [step]);

  function setErr(key: string, msg: string) {
    setErrors((e) => ({ ...e, [key]: msg }));
  }

  function clearErrors() {
    setErrors({});
  }

  function validateCurrentStep() {
    clearErrors();
    let ok = true;

    if (step === 1) {
      if (!f.nome.trim()) (ok = false), setErr("nome", "Informe o nome.");
      if (!f.email.trim() || !/^\S+@\S+\.\S+$/.test(f.email)) (ok = false), setErr("email", "Informe um e-mail válido.");
      if (!f.endereco.trim()) (ok = false), setErr("endereco", "Informe o endereço.");
      if (onlyDigits(f.telefone).length < 10) (ok = false), setErr("telefone", "Informe telefone com DDD.");
      if (!validateCpf(f.cpf)) (ok = false), setErr("cpf", "Informe um CPF válido (11 dígitos).");
      if (!f.escolaridade.trim()) (ok = false), setErr("escolaridade", "Informe escolaridade.");
      if (!f.estadoCivil.trim()) (ok = false), setErr("estadoCivil", "Informe estado civil.");
    }

    if (step === 2) {
      if (f.rendaFamiliar === "Outro" && !f.rendaOutro.trim()) (ok = false), setErr("rendaOutro", "Descreva a renda (Outro).");
      if (f.cadastradoBeneficio === "Outro" && !f.beneficioOutro.trim()) (ok = false), setErr("beneficioOutro", "Descreva (Outro).");
      if (f.cadastradoBeneficio === "Sim" && !f.beneficioQual.trim()) (ok = false), setErr("beneficioQual", "Informe qual benefício.");
      if (f.moradia === "Outro" && !f.moradiaOutro.trim()) (ok = false), setErr("moradiaOutro", "Descreva moradia (Outro).");
    }

    if (step === 3) {
      if (f.racaCor.length === 0) (ok = false), setErr("racaCor", "Selecione ao menos uma opção.");
      if (f.racaCor.includes("Outro") && !f.racaCorOutro.trim()) (ok = false), setErr("racaCorOutro", "Descreva (Outro).");

      if (f.orientacaoSexual.length === 0) (ok = false), setErr("orientacaoSexual", "Selecione ao menos uma opção.");
      if (f.orientacaoSexual.includes("Outro") && !f.orientacaoOutro.trim()) (ok = false), setErr("orientacaoOutro", "Descreva (Outro).");

      if (f.identidadeGenero.length === 0) (ok = false), setErr("identidadeGenero", "Selecione ao menos uma opção.");
      if (f.identidadeGenero.includes("Outro") && !f.generoOutro.trim()) (ok = false), setErr("generoOutro", "Descreva (Outro).");
    }

    if (step === 4) {
      if (f.pcd === "Sim" && f.pcdTipos.length === 0) (ok = false), setErr("pcdTipos", "Selecione ao menos um tipo de deficiência.");
      if (f.pcd === "Sim" && f.pcdTipos.includes("Outro") && !f.pcdOutro.trim()) (ok = false), setErr("pcdOutro", "Descreva (Outro).");

      if (f.comunidadeTradicional === "Sim" && f.comunidadeTipos.length === 0) (ok = false), setErr("comunidadeTipos", "Selecione ao menos uma comunidade.");
      if (f.comunidadeTradicional === "Sim" && f.comunidadeTipos.includes("Outro") && !f.comunidadeOutro.trim()) (ok = false), setErr("comunidadeOutro", "Descreva (Outro).");
    }

    if (step === 5) {
      if (f.qtdResidentes < 1) (ok = false), setErr("qtdResidentes", "Informe ao menos 1 residente.");
      if (f.qtdCriancasAdolescentes < 0) (ok = false), setErr("qtdCriancasAdolescentes", "Valor inválido.");
      if (f.qtdIdosos < 0) (ok = false), setErr("qtdIdosos", "Valor inválido.");
      if (f.qtdMulheres < 0) (ok = false), setErr("qtdMulheres", "Valor inválido.");
    }

    if (step === 6) {
      if (f.qtdPcdResidencia < 0) (ok = false), setErr("qtdPcdResidencia", "Valor inválido.");
      if (f.qtdDoencaRara < 0) (ok = false), setErr("qtdDoencaRara", "Valor inválido.");
      if (f.qtdLgbtqia < 0) (ok = false), setErr("qtdLgbtqia", "Valor inválido.");
    }

    return ok;
  }

  function next() {
    if (!validateCurrentStep()) return;
    setStep((s) => Math.min(7, s + 1));
  }

  function prev() {
    clearErrors();
    setStep((s) => Math.max(1, s - 1));
  }

  function finalizar() {
    if (!validateCurrentStep()) return;

    const triagem: Triagem = {
      id: uid(),
      createdAt: new Date().toISOString(),

      nome: f.nome.trim(),
      email: f.email.trim(),
      endereco: f.endereco.trim(),
      telefone: f.telefone.trim(),
      cpf: onlyDigits(f.cpf),
      escolaridade: f.escolaridade.trim(),
      estadoCivil: f.estadoCivil.trim(),

      rendaFamiliar: f.rendaFamiliar,
      rendaOutro: f.rendaFamiliar === "Outro" ? f.rendaOutro.trim() : undefined,
      cadastradoBeneficio: f.cadastradoBeneficio,
      beneficioOutro: f.cadastradoBeneficio === "Outro" ? f.beneficioOutro.trim() : undefined,
      beneficioQual: f.cadastradoBeneficio === "Sim" ? f.beneficioQual.trim() : undefined,
      moradia: f.moradia,
      moradiaOutro: f.moradia === "Outro" ? f.moradiaOutro.trim() : undefined,

      racaCor: f.racaCor,
      racaCorOutro: f.racaCor.includes("Outro") ? f.racaCorOutro.trim() : undefined,
      orientacaoSexual: f.orientacaoSexual,
      orientacaoOutro: f.orientacaoSexual.includes("Outro") ? f.orientacaoOutro.trim() : undefined,
      identidadeGenero: f.identidadeGenero,
      generoOutro: f.identidadeGenero.includes("Outro") ? f.generoOutro.trim() : undefined,
      pcd: f.pcd,

      pcdTipos: f.pcd === "Sim" ? f.pcdTipos : [],
      pcdOutro: f.pcd === "Sim" && f.pcdTipos.includes("Outro") ? f.pcdOutro.trim() : undefined,
      idoso: f.idoso,
      comunidadeTradicional: f.comunidadeTradicional,
      comunidadeTipos: f.comunidadeTradicional === "Sim" ? f.comunidadeTipos : [],
      comunidadeOutro: f.comunidadeTradicional === "Sim" && f.comunidadeTipos.includes("Outro") ? f.comunidadeOutro.trim() : undefined,

      qtdResidentes: Number(f.qtdResidentes),
      qtdCriancasAdolescentes: Number(f.qtdCriancasAdolescentes),
      criancasNomesDatas: f.criancasNomesDatas.trim() || undefined,
      qtdIdosos: Number(f.qtdIdosos),
      idososNomesDatas: f.idososNomesDatas.trim() || undefined,
      qtdMulheres: Number(f.qtdMulheres),

      mulheresNomesDatas: f.mulheresNomesDatas.trim() || undefined,
      qtdPcdResidencia: Number(f.qtdPcdResidencia),
      pcdNomesDatas: f.pcdNomesDatas.trim() || undefined,
      qtdDoencaRara: Number(f.qtdDoencaRara),
      qtdLgbtqia: Number(f.qtdLgbtqia),
      lgbtqiaNomesDatas: f.lgbtqiaNomesDatas.trim() || undefined,
    };

    saveTriagem(triagem);
    setQuestionarioCompleto(true);
    nav("/login");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="h2">Questionário de Triagem</h2>
          <p className="muted mt-1">Preencha para acessar os serviços do Portal dos Direitos Humanos.</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
          {progressText}
        </div>
      </div>

      {/* STEPS */}
      <div className="mt-6 space-y-5">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="h3">Dados Pessoais</h3>

            <div>
              <label className="label">Nome *</label>
              <input className="input" value={f.nome} onChange={(e) => setF((s) => ({ ...s, nome: e.target.value }))} />
              {errors.nome && <p className="mt-1 text-xs text-red-600">{errors.nome}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">E-mail *</label>
                <input className="input" value={f.email} onChange={(e) => setF((s) => ({ ...s, email: e.target.value }))} />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label className="label">Telefone (com DDD) *</label>
                <input className="input" value={f.telefone} onChange={(e) => setF((s) => ({ ...s, telefone: e.target.value }))} />
                {errors.telefone && <p className="mt-1 text-xs text-red-600">{errors.telefone}</p>}
              </div>
            </div>

            <div>
              <label className="label">Endereço *</label>
              <input className="input" value={f.endereco} onChange={(e) => setF((s) => ({ ...s, endereco: e.target.value }))} />
              {errors.endereco && <p className="mt-1 text-xs text-red-600">{errors.endereco}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">CPF *</label>
                <input className="input" value={f.cpf} onChange={(e) => setF((s) => ({ ...s, cpf: e.target.value }))} />
                {errors.cpf && <p className="mt-1 text-xs text-red-600">{errors.cpf}</p>}
              </div>
              <div>
                <label className="label">Escolaridade *</label>
                <input className="input" value={f.escolaridade} onChange={(e) => setF((s) => ({ ...s, escolaridade: e.target.value }))} />
                {errors.escolaridade && <p className="mt-1 text-xs text-red-600">{errors.escolaridade}</p>}
              </div>
              <div>
                <label className="label">Estado Civil *</label>
                <input className="input" value={f.estadoCivil} onChange={(e) => setF((s) => ({ ...s, estadoCivil: e.target.value }))} />
                {errors.estadoCivil && <p className="mt-1 text-xs text-red-600">{errors.estadoCivil}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="h3">Informações complementares</h3>

            <div>
              <label className="label">Renda familiar *</label>
              <select className="input" value={f.rendaFamiliar} onChange={(e) => setF((s) => ({ ...s, rendaFamiliar: e.target.value as RendaFamiliar }))}>
                {rendaOptions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {f.rendaFamiliar === "Outro" && (
                <div className="mt-2">
                  <input className="input" placeholder="Descreva..." value={f.rendaOutro} onChange={(e) => setF((s) => ({ ...s, rendaOutro: e.target.value }))} />
                  {errors.rendaOutro && <p className="mt-1 text-xs text-red-600">{errors.rendaOutro}</p>}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">É cadastrado em programa/benefício social? *</label>
                <select className="input" value={f.cadastradoBeneficio} onChange={(e) => setF((s) => ({ ...s, cadastradoBeneficio: e.target.value as any }))}>
                  <option>Sim</option>
                  <option>Não</option>
                  <option>Outro</option>
                </select>
                {f.cadastradoBeneficio === "Outro" && (
                  <div className="mt-2">
                    <input className="input" placeholder="Outro..." value={f.beneficioOutro} onChange={(e) => setF((s) => ({ ...s, beneficioOutro: e.target.value }))} />
                    {errors.beneficioOutro && <p className="mt-1 text-xs text-red-600">{errors.beneficioOutro}</p>}
                  </div>
                )}
              </div>

              <div>
                <label className="label">Se sim, qual?</label>
                <input className="input" value={f.beneficioQual} onChange={(e) => setF((s) => ({ ...s, beneficioQual: e.target.value }))} />
                {errors.beneficioQual && <p className="mt-1 text-xs text-red-600">{errors.beneficioQual}</p>}
              </div>
            </div>

            <div>
              <label className="label">Situação de moradia *</label>
              <select className="input" value={f.moradia} onChange={(e) => setF((s) => ({ ...s, moradia: e.target.value as Moradia }))}>
                {moradiaOptions.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              {f.moradia === "Outro" && (
                <div className="mt-2">
                  <input className="input" placeholder="Descreva..." value={f.moradiaOutro} onChange={(e) => setF((s) => ({ ...s, moradiaOutro: e.target.value }))} />
                  {errors.moradiaOutro && <p className="mt-1 text-xs text-red-600">{errors.moradiaOutro}</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="h3">Perfil (Raça/Cor • Sexualidade • Gênero • PCD)</h3>

            <div>
              <div className="label">Raça/cor *</div>
              <ToggleList options={racaOptions} value={f.racaCor} onChange={(v) => setF((s) => ({ ...s, racaCor: v }))} />
              {errors.racaCor && <p className="mt-1 text-xs text-red-600">{errors.racaCor}</p>}
              {f.racaCor.includes("Outro") && (
                <div className="mt-2">
                  <input className="input" placeholder="Descreva..." value={f.racaCorOutro} onChange={(e) => setF((s) => ({ ...s, racaCorOutro: e.target.value }))} />
                  {errors.racaCorOutro && <p className="mt-1 text-xs text-red-600">{errors.racaCorOutro}</p>}
                </div>
              )}
            </div>

            <div>
              <div className="label">Orientação sexual *</div>
              <ToggleList options={orientOptions} value={f.orientacaoSexual} onChange={(v) => setF((s) => ({ ...s, orientacaoSexual: v }))} />
              {errors.orientacaoSexual && <p className="mt-1 text-xs text-red-600">{errors.orientacaoSexual}</p>}
              {f.orientacaoSexual.includes("Outro") && (
                <div className="mt-2">
                  <input className="input" placeholder="Descreva..." value={f.orientacaoOutro} onChange={(e) => setF((s) => ({ ...s, orientacaoOutro: e.target.value }))} />
                  {errors.orientacaoOutro && <p className="mt-1 text-xs text-red-600">{errors.orientacaoOutro}</p>}
                </div>
              )}
            </div>

            <div>
              <div className="label">Identidade de Gênero *</div>
              <ToggleList options={generoOptions} value={f.identidadeGenero} onChange={(v) => setF((s) => ({ ...s, identidadeGenero: v }))} />
              {errors.identidadeGenero && <p className="mt-1 text-xs text-red-600">{errors.identidadeGenero}</p>}
              {f.identidadeGenero.includes("Outro") && (
                <div className="mt-2">
                  <input className="input" placeholder="Descreva..." value={f.generoOutro} onChange={(e) => setF((s) => ({ ...s, generoOutro: e.target.value }))} />
                  {errors.generoOutro && <p className="mt-1 text-xs text-red-600">{errors.generoOutro}</p>}
                </div>
              )}
            </div>

            <div>
              <label className="label">Pessoa com deficiência *</label>
              <select className="input" value={f.pcd} onChange={(e) => setF((s) => ({ ...s, pcd: e.target.value as any }))}>
                <option>Sim</option>
                <option>Não</option>
              </select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="h3">PCD • Pessoa Idosa • Comunidade Tradicional</h3>

            {f.pcd === "Sim" && (
              <div>
                <div className="label">Se sim, qual? *</div>
                <ToggleList options={defOptions} value={f.pcdTipos} onChange={(v) => setF((s) => ({ ...s, pcdTipos: v }))} />
                {errors.pcdTipos && <p className="mt-1 text-xs text-red-600">{errors.pcdTipos}</p>}
                {f.pcdTipos.includes("Outro") && (
                  <div className="mt-2">
                    <input className="input" placeholder="Descreva..." value={f.pcdOutro} onChange={(e) => setF((s) => ({ ...s, pcdOutro: e.target.value }))} />
                    {errors.pcdOutro && <p className="mt-1 text-xs text-red-600">{errors.pcdOutro}</p>}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="label">Pessoa idosa? *</label>
              <select className="input" value={f.idoso} onChange={(e) => setF((s) => ({ ...s, idoso: e.target.value as any }))}>
                <option>Sim</option>
                <option>Não</option>
              </select>
            </div>

            <div>
              <label className="label">Faz parte de alguma comunidade tradicional? *</label>
              <select className="input" value={f.comunidadeTradicional} onChange={(e) => setF((s) => ({ ...s, comunidadeTradicional: e.target.value as any }))}>
                <option>Sim</option>
                <option>Não</option>
              </select>
            </div>

            {f.comunidadeTradicional === "Sim" && (
              <div>
                <div className="label">Se sim, qual? *</div>
                <ToggleList options={comOptions} value={f.comunidadeTipos} onChange={(v) => setF((s) => ({ ...s, comunidadeTipos: v }))} />
                {errors.comunidadeTipos && <p className="mt-1 text-xs text-red-600">{errors.comunidadeTipos}</p>}
                {f.comunidadeTipos.includes("Outro") && (
                  <div className="mt-2">
                    <input className="input" placeholder="Descreva..." value={f.comunidadeOutro} onChange={(e) => setF((s) => ({ ...s, comunidadeOutro: e.target.value }))} />
                    {errors.comunidadeOutro && <p className="mt-1 text-xs text-red-600">{errors.comunidadeOutro}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="h3">Composição familiar</h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Na residência, quantas pessoas residem? *</label>
                <input className="input" type="number" value={f.qtdResidentes} onChange={(e) => setF((s) => ({ ...s, qtdResidentes: Number(e.target.value) }))} />
                {errors.qtdResidentes && <p className="mt-1 text-xs text-red-600">{errors.qtdResidentes}</p>}
              </div>

              <div>
                <label className="label">Quantas são crianças e adolescentes? *</label>
                <input className="input" type="number" value={f.qtdCriancasAdolescentes} onChange={(e) => setF((s) => ({ ...s, qtdCriancasAdolescentes: Number(e.target.value) }))} />
                {errors.qtdCriancasAdolescentes && <p className="mt-1 text-xs text-red-600">{errors.qtdCriancasAdolescentes}</p>}
              </div>

              <div>
                <label className="label">Quantas pessoas são idosas? *</label>
                <input className="input" type="number" value={f.qtdIdosos} onChange={(e) => setF((s) => ({ ...s, qtdIdosos: Number(e.target.value) }))} />
                {errors.qtdIdosos && <p className="mt-1 text-xs text-red-600">{errors.qtdIdosos}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Nome e data de nascimento (crianças/adolescentes)</label>
                <textarea className="input" style={{ minHeight: 90 }} value={f.criancasNomesDatas} onChange={(e) => setF((s) => ({ ...s, criancasNomesDatas: e.target.value }))} />
              </div>

              <div>
                <label className="label">Nome e data de nascimento (idosos)</label>
                <textarea className="input" style={{ minHeight: 90 }} value={f.idososNomesDatas} onChange={(e) => setF((s) => ({ ...s, idososNomesDatas: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="label">Quantas são mulheres? *</label>
              <input className="input" type="number" value={f.qtdMulheres} onChange={(e) => setF((s) => ({ ...s, qtdMulheres: Number(e.target.value) }))} />
              {errors.qtdMulheres && <p className="mt-1 text-xs text-red-600">{errors.qtdMulheres}</p>}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h3 className="h3">Composição familiar (continuação)</h3>

            <div>
              <label className="label">Nome e data de nascimento (mulheres)</label>
              <textarea className="input" style={{ minHeight: 90 }} value={f.mulheresNomesDatas} onChange={(e) => setF((s) => ({ ...s, mulheresNomesDatas: e.target.value }))} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Quantas pessoas são pessoas com deficiência?</label>
                <input className="input" type="number" value={f.qtdPcdResidencia} onChange={(e) => setF((s) => ({ ...s, qtdPcdResidencia: Number(e.target.value) }))} />
                {errors.qtdPcdResidencia && <p className="mt-1 text-xs text-red-600">{errors.qtdPcdResidencia}</p>}
              </div>

              <div>
                <label className="label">Nome e data de nascimento (PCD)</label>
                <textarea className="input" style={{ minHeight: 90 }} value={f.pcdNomesDatas} onChange={(e) => setF((s) => ({ ...s, pcdNomesDatas: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Quantas com doença rara?</label>
                <input className="input" type="number" value={f.qtdDoencaRara} onChange={(e) => setF((s) => ({ ...s, qtdDoencaRara: Number(e.target.value) }))} />
              </div>

              <div>
                <label className="label">Quantas pessoas são LGBTQIAPN+?</label>
                <input className="input" type="number" value={f.qtdLgbtqia} onChange={(e) => setF((s) => ({ ...s, qtdLgbtqia: Number(e.target.value) }))} />
              </div>
            </div>

            <div>
              <label className="label">Nome e data de nascimento (LGBTQIAPN+)</label>
              <textarea className="input" style={{ minHeight: 90 }} value={f.lgbtqiaNomesDatas} onChange={(e) => setF((s) => ({ ...s, lgbtqiaNomesDatas: e.target.value }))} />
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <h3 className="h3">Revisão</h3>
            <p className="body">
              Revise suas informações. Ao finalizar, você será direcionado(a) para realizar login e acessar os serviços do portal.
            </p>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Resumo</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div><strong>Nome:</strong> {f.nome || "-"}</div>
                <div><strong>E-mail:</strong> {f.email || "-"}</div>
                <div><strong>Telefone:</strong> {f.telefone || "-"}</div>
                <div><strong>CPF:</strong> {f.cpf || "-"}</div>
                <div className="sm:col-span-2"><strong>Endereço:</strong> {f.endereco || "-"}</div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Atenção: este protótipo salva informações no navegador (localStorage). Para uso real, recomenda-se backend seguro.
            </div>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={prev}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          disabled={step === 1}
        >
          Voltar
        </button>

        <div className="flex flex-col gap-2 sm:flex-row">
          {step < 7 ? (
            <button
              type="button"
              onClick={next}
              className="rounded-xl bg-[#1b4c7d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163e66]"
            >
              Avançar
            </button>
          ) : (
            <button
              type="button"
              onClick={finalizar}
              className="rounded-xl bg-[#1b4c7d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163e66]"
            >
              Finalizar e ir para login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
