export type Segmento = "Candombl\u00e9" | "Umbanda" | "Jurema" | "Culto tradicional Iorub\u00e1";
export type RacaCor = "Preto" | "Branco" | "Pardo" | "Amarelo" | "Ind\u00edgena";

export type Terreiro = {
  id: string;
  nomeCasa: string;
  anoFundacao: number;
  segmento: Segmento;
  qtdFilhosSanto: number;
  endereco: string;
  liderReligioso: string;
  telefone: string;
  email: string;
  racaCor: RacaCor;
  createdAt: string;
};
