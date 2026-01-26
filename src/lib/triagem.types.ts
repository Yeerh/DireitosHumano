export type RendaFamiliar =
  | "Menos de um salário"
  | "De 1 a 3 salário"
  | "Quatro salário"
  | "Outro";

export type Moradia =
  | "Casa própria"
  | "Casa alugada"
  | "Moro com familiares"
  | "Outro";

export type RacaCor = "Preto" | "Pardo" | "Amarelo" | "Indígena" | "Branco" | "Outro";

export type OrientacaoSexual =
  | "Heterossexual"
  | "Homossexual"
  | "Bissexualidade"
  | "Pansexualidade"
  | "Assexualidade"
  | "Outro";

export type IdentidadeGenero =
  | "Cisgênero"
  | "Transgênero"
  | "Não Binário"
  | "Intersexo"
  | "Outro";

export type DeficienciaTipo =
  | "Motora"
  | "Física"
  | "visual"
  | "Auditiva"
  | "Intelectual"
  | "TEA"
  | "Multiplas"
  | "Fibromiogia"
  | "Outro";

export type ComunidadeTradicional =
  | "Quilombolas"
  | "Terreiro"
  | "Romani, Cigano"
  | "Indígena"
  | "Ribeirinho"
  | "Outro";

export type Triagem = {
  id: string;
  createdAt: string;

  // 1/7 Dados pessoais
  nome: string;
  email: string;
  endereco: string;
  telefone: string;
  cpf: string;
  escolaridade: string;
  estadoCivil: string;

  // 2/7 Renda/benefícios/moradia
  rendaFamiliar: RendaFamiliar;
  rendaOutro?: string;
  cadastradoBeneficio: "Sim" | "Não" | "Outro";
  beneficioOutro?: string;
  beneficioQual?: string;
  moradia: Moradia;
  moradiaOutro?: string;

  // 3/7 Raça/cor, orientação, gênero, PCD
  racaCor: RacaCor[];
  racaCorOutro?: string;
  orientacaoSexual: OrientacaoSexual[];
  orientacaoOutro?: string;
  identidadeGenero: IdentidadeGenero[];
  generoOutro?: string;
  pcd: "Sim" | "Não";

  // 4/7 PCD tipo + idoso + comunidade tradicional
  pcdTipos: DeficienciaTipo[];
  pcdOutro?: string;
  idoso: "Sim" | "Não";
  comunidadeTradicional: "Sim" | "Não";
  comunidadeTipos: ComunidadeTradicional[];
  comunidadeOutro?: string;

  // 5/7 Composição familiar (parte 1)
  qtdResidentes: number;
  qtdCriancasAdolescentes: number;
  criancasNomesDatas?: string;

  qtdIdosos: number;
  idososNomesDatas?: string;

  qtdMulheres: number;

  // 6/7 Composição familiar (parte 2)
  mulheresNomesDatas?: string;

  qtdPcdResidencia: number;
  pcdNomesDatas?: string;

  qtdDoencaRara: number;
  qtdLgbtqia: number;
  lgbtqiaNomesDatas?: string;
};
