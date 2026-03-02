export type DenunciaTipo = "Den\u00fancia" | "Sugest\u00e3o";

export type DenunciaCategoria =
  | "Discrimina\u00e7\u00e3o / Intoler\u00e2ncia religiosa"
  | "Vandalismo / Dano ao patrim\u00f4nio"
  | "Amea\u00e7a / Ass\u00e9dio"
  | "Conflito de vizinhan\u00e7a"
  | "Outros";

export type Denuncia = {
  id: string;
  tipo: DenunciaTipo;
  categoria: DenunciaCategoria;
  titulo: string;
  mensagem: string;
  localOcorrido?: string;
  anonimo: boolean;
  nome?: string;
  telefone?: string;
  email?: string;
  createdAt: string;
  status: "Recebido";
};
