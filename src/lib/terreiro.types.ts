export type Segmento = "Umbanda" | "Candomblé" | "Jurema" | "Culto tradicional Iorubá" | "Outro";

export type Terreiro = {
  id: string;
  createdAt: string;
  triagemId: string;

  nomeCasa: string;
  anoFundacao: string;
  segmento: Segmento;
  segmentoOutro?: string;

  qtdFilhosSanto: number;
  endereco: string;

  liderReligioso: string;
  telefone: string;
  email: string;
};
