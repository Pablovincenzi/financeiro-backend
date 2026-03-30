import { z } from "zod";

const moneyMessage = "Informe um valor monetario valido.";

const currencyString = z
  .string()
  .trim()
  .min(1, moneyMessage)
  .refine((value) => /^\d+(?:[\.,]\d{1,2})?$/.test(value.replace(/\s/g, "")), moneyMessage)
  .refine((value) => Number.parseFloat(value.replace(/\./g, "").replace(",", ".")) > 0, "O valor deve ser maior que zero.");

const optionalText = z.string().trim().max(500).optional().or(z.literal(""));
const optionalShort = z.string().trim().max(120).optional().or(z.literal(""));
const optionalCategory = z.string().trim().max(80).optional().or(z.literal(""));
const requiredTag = z.coerce.number().int().positive("Selecione uma tag.");
const dateString = (message: string) =>
  z
    .string()
    .min(1, message)
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Informe uma data valida.");

export const receitaSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  descricao: z.string().trim().min(3).max(150),
  valor: currencyString,
  dataRecebimento: dateString("Informe a data de recebimento."),
  categoria: optionalCategory,
  tagId: requiredTag,
  observacoes: optionalText,
  status: z.enum(["prevista", "recebida"]).default("prevista"),
});

export const despesaSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  descricao: z.string().trim().min(3).max(150),
  valor: currencyString,
  dataVencimento: dateString("Informe a data de vencimento."),
  dataPagamento: z.string().optional().or(z.literal("")),
  categoriaId: z.coerce.number().int().positive("Selecione uma categoria."),
  tagId: requiredTag,
  observacoes: optionalText,
  status: z.enum(["pendente", "paga"]).default("pendente"),
});

export const categoriaDespesaSchema = z
  .object({
    id: z.coerce.number().int().positive().optional(),
    nome: z.string().trim().min(3, "Informe o nome da categoria.").max(120),
    dataInicio: dateString("Informe a data de inicio."),
    dataFim: z.string().optional().or(z.literal("")),
    observacoes: optionalText,
    usuariosIds: z.array(z.coerce.number().int().positive()).min(1, "Selecione ao menos um usuario."),
  })
  .refine((data) => !data.dataFim || new Date(data.dataFim) >= new Date(data.dataInicio), {
    message: "A data fim deve ser maior ou igual a data inicio.",
    path: ["dataFim"],
  });

export const contaFixaSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  descricao: z.string().trim().min(3).max(150),
  valorPrevisto: currencyString,
  diaVencimento: z.coerce.number().int().min(1).max(31),
  categoria: optionalCategory,
  periodicidade: z.enum(["mensal", "bimestral", "trimestral", "anual"]).default("mensal"),
  proximoVencimento: z.string().optional().or(z.literal("")),
  observacoes: optionalText,
  ativa: z.enum(["true", "false"]).default("true"),
});

export const cartaoSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  nome: z.string().trim().min(2).max(120),
  bandeira: z.string().trim().max(50).optional().or(z.literal("")),
  apelido: z.string().trim().max(80).optional().or(z.literal("")),
  ultimosDigitos: z.string().trim().regex(/^\d{4}$/, "Informe os 4 ultimos digitos."),
  limite: z.string().trim().optional().or(z.literal("")),
  diaFechamento: z.coerce.number().int().min(1).max(31),
  diaVencimento: z.coerce.number().int().min(1).max(31),
  ativo: z.enum(["true", "false"]).default("true"),
});

export const faturaSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  cartaoId: z.coerce.number().int().positive(),
  competencia: z.string().trim().regex(/^\d{4}-\d{2}$/, "Use o formato AAAA-MM."),
  dataFechamento: dateString("Informe a data de fechamento."),
  dataVencimento: dateString("Informe a data de vencimento."),
  valorTotal: currencyString,
  valorPago: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["aberta", "fechada", "paga"]).default("aberta"),
});

export const compraCartaoSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  cartaoId: z.coerce.number().int().positive(),
  faturaId: z.string().trim().optional().or(z.literal("")),
  descricao: z.string().trim().min(3).max(150),
  valor: currencyString,
  dataCompra: dateString("Informe a data da compra."),
  categoria: optionalCategory,
  observacoes: optionalText,
  status: z.enum(["lancada", "cancelada"]).default("lancada"),
});

export const pixSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  tipo: z.enum(["enviado", "recebido"]).default("recebido"),
  valor: currencyString,
  dataPix: dateString("Informe a data do PIX."),
  descricao: z.string().trim().min(3).max(150),
  conta: optionalShort,
  categoria: optionalCategory,
  observacoes: optionalText,
});

export const recebivelSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  descricao: z.string().trim().min(3).max(150),
  valorPrevisto: currencyString,
  dataEsperada: dateString("Informe a data esperada."),
  dataRecebimento: z.string().optional().or(z.literal("")),
  origem: optionalShort,
  categoria: optionalCategory,
  observacoes: optionalText,
  status: z.enum(["pendente", "recebido", "atrasado"]).default("pendente"),
});

export type ReceitaInput = z.infer<typeof receitaSchema>;
export type DespesaInput = z.infer<typeof despesaSchema>;
export type CategoriaDespesaInput = z.infer<typeof categoriaDespesaSchema>;
export type ContaFixaInput = z.infer<typeof contaFixaSchema>;
export type CartaoInput = z.infer<typeof cartaoSchema>;
export type FaturaInput = z.infer<typeof faturaSchema>;
export type CompraCartaoInput = z.infer<typeof compraCartaoSchema>;
export type PixInput = z.infer<typeof pixSchema>;
export type RecebivelInput = z.infer<typeof recebivelSchema>;