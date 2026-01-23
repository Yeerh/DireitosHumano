export type DenunciaTipo = "Denúncia" | "Sugestão";
export type DenunciaCategoria =
  | "Discriminação / Intolerância religiosa"
  | "Vandalismo / Dano ao patrimônio"
  | "Ameaça / Assédio"
  | "Conflito de vizinhança"
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
