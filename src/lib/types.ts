export type Segmento = "Candomblé" | "Umbanda" | "Jurema" | "Culto tradicional Iorubá";
export type RacaCor = "Preto" | "Branco" | "Pardo" | "Amarelo" | "Indígena";

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
  createdAt: string; // ISO
};
