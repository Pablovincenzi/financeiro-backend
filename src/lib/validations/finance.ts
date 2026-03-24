import { z } from "zod";

const moneyMessage = "Informe um valor monetario valido.";

const currencyString = z
  .string()
  .trim()
  .min(1, moneyMessage)
  .refine((value) => /^\d+(?:[\.,]\d{1,2})?$/.test(value.replace(/\s/g, "")), moneyMessage);

const optionalText = z.string().trim().max(500).optional().or(z.literal(""));

export const receitaSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  descricao: z.string().trim().min(3).max(150),
  valor: currencyString,
  dataRecebimento: z.string().min(1, "Informe a data de recebimento."),
  categoria: z.string().trim().max(80).optional().or(z.literal("")),
  observacoes: optionalText,
  status: z.enum(["prevista", "recebida"]).default("prevista"),
});

export const despesaSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  descricao: z.string().trim().min(3).max(150),
  valor: currencyString,
  dataVencimento: z.string().min(1, "Informe a data de vencimento."),
  dataPagamento: z.string().optional().or(z.literal("")),
  categoria: z.string().trim().max(80).optional().or(z.literal("")),
  observacoes: optionalText,
  status: z.enum(["pendente", "paga"]).default("pendente"),
});

export const contaFixaSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  descricao: z.string().trim().min(3).max(150),
  valorPrevisto: currencyString,
  diaVencimento: z.coerce.number().int().min(1).max(31),
  categoria: z.string().trim().max(80).optional().or(z.literal("")),
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
  dataFechamento: z.string().min(1, "Informe a data de fechamento."),
  dataVencimento: z.string().min(1, "Informe a data de vencimento."),
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
  dataCompra: z.string().min(1, "Informe a data da compra."),
  categoria: z.string().trim().max(80).optional().or(z.literal("")),
  observacoes: optionalText,
  status: z.enum(["lancada", "cancelada"]).default("lancada"),
});

export type ReceitaInput = z.infer<typeof receitaSchema>;
export type DespesaInput = z.infer<typeof despesaSchema>;
export type ContaFixaInput = z.infer<typeof contaFixaSchema>;
export type CartaoInput = z.infer<typeof cartaoSchema>;
export type FaturaInput = z.infer<typeof faturaSchema>;
export type CompraCartaoInput = z.infer<typeof compraCartaoSchema>;
