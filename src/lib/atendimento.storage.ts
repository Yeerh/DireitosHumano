export type AtendimentoTipo =
  | "Acolhimento"
  | "Orientação"
  | "Encaminhamento"
  | "Registro de ocorrência"
  | "Outro";

export type Atendimento = {
  id: string;
  createdAt: string;
  triagemId: string;

  tipo: AtendimentoTipo;
  titulo: string;
  descricao: string;

  dataAtendimento: string; // YYYY-MM-DD
  local?: string;

  status: "Recebido";
};
