/**
 * Mapeamento entre valores do frontend e enums do Prisma (MySQL).
 * Prisma exige identificadores ASCII nos enums.
 */

export const SEGMENTO_TO_DB = {
  "Candomblé": "Candomble",
  "Umbanda": "Umbanda",
  "Jurema": "Jurema",
  "Culto tradicional Iorubá": "Culto_tradicional_Ioruba",
};

export const SEGMENTO_TO_FRONT = {
  Candomble: "Candomblé",
  Umbanda: "Umbanda",
  Jurema: "Jurema",
  Culto_tradicional_Ioruba: "Culto tradicional Iorubá",
};

export const RACA_COR_TO_DB = {
  "Preto": "Preto",
  "Branco": "Branco",
  "Pardo": "Pardo",
  "Amarelo": "Amarelo",
  "Indígena": "Indigena",
};

export const RACA_COR_TO_FRONT = {
  Preto: "Preto",
  Branco: "Branco",
  Pardo: "Pardo",
  Amarelo: "Amarelo",
  Indigena: "Indígena",
};

export const DENUNCIA_TIPO_TO_DB = {
  "Denúncia": "Denuncia",
  "Sugestão": "Sugestao",
};

export const DENUNCIA_TIPO_TO_FRONT = {
  Denuncia: "Denúncia",
  Sugestao: "Sugestão",
};

export const DENUNCIA_CATEGORIA_TO_DB = {
  "Discriminação / Intolerância religiosa": "Discriminacao_Intolerancia_religiosa",
  "Vandalismo / Dano ao patrimônio": "Vandalismo_Dano_patrimonio",
  "Ameaça / Assédio": "Ameaca_Assedio",
  "Conflito de vizinhança": "Conflito_vizinhanca",
  "Outros": "Outros",
};

export const DENUNCIA_CATEGORIA_TO_FRONT = {
  Discriminacao_Intolerancia_religiosa: "Discriminação / Intolerância religiosa",
  Vandalismo_Dano_patrimonio: "Vandalismo / Dano ao patrimônio",
  Ameaca_Assedio: "Ameaça / Assédio",
  Conflito_vizinhanca: "Conflito de vizinhança",
  Outros: "Outros",
};
