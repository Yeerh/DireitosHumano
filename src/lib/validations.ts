import { z } from "zod";

export const segmentoValues = [
  "Candomblé",
  "Umbanda",
  "Jurema",
  "Culto tradicional Iorubá",
] as const;

export const racaCorValues = ["Preto", "Branco", "Pardo", "Amarelo", "Indígena"] as const;

export const terreiroSchema = z.object({
  nomeCasa: z.string().min(2, "Informe o nome da casa de Axé."),
  anoFundacao: z.coerce
    .number()
    .int("Ano inválido.")
    .min(1500, "Ano inválido.")
    .max(new Date().getFullYear(), "Ano não pode ser maior que o atual."),
  segmento: z.enum(segmentoValues, { message: "Selecione um segmento." }),
  qtdFilhosSanto: z.coerce.number().int().min(0, "Quantidade inválida."),
  endereco: z.string().min(5, "Informe o endereço."),
  liderReligioso: z.string().min(2, "Informe o nome do líder religioso."),
  telefone: z
    .string()
    .min(8, "Telefone inválido.")
    .transform((v) => v.trim()),
  email: z.string().email("Email inválido."),
  racaCor: z.enum(racaCorValues, { message: "Selecione raça/cor." }),
});

export type TerreiroFormData = z.infer<typeof terreiroSchema>;
