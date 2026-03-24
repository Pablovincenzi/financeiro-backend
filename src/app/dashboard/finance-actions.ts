"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth";
import { parseCurrencyToNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import {
  cartaoSchema,
  contaFixaSchema,
  compraCartaoSchema,
  despesaSchema,
  faturaSchema,
  pixSchema,
  recebivelSchema,
  receitaSchema,
} from "@/lib/validations/finance";

function emptyToNull(value?: string) {
  if (!value || !value.trim()) {
    return null;
  }

  return value.trim();
}

function emptyToDate(value?: string) {
  if (!value || !value.trim()) {
    return null;
  }

  return new Date(value);
}

function emptyMoneyToNull(value?: string) {
  if (!value || !value.trim()) {
    return null;
  }

  return parseCurrencyToNumber(value);
}

function revalidateAllPages() {
  [
    "/dashboard",
    "/dashboard/receitas",
    "/dashboard/despesas",
    "/dashboard/contas-fixas",
    "/dashboard/cartoes",
    "/dashboard/compras-cartao",
    "/dashboard/faturas",
    "/dashboard/pix",
    "/dashboard/recebiveis",
  ].forEach((path) => revalidatePath(path));
}

export async function saveReceita(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const parsed = receitaSchema.parse({
    id: formData.get("id") || undefined,
    descricao: formData.get("descricao"),
    valor: formData.get("valor"),
    dataRecebimento: formData.get("dataRecebimento"),
    categoria: formData.get("categoria"),
    observacoes: formData.get("observacoes"),
    status: formData.get("status"),
  });

  const data = {
    usuarioId: userId,
    descricao: parsed.descricao,
    valor: parseCurrencyToNumber(parsed.valor),
    dataRecebimento: new Date(parsed.dataRecebimento),
    categoria: emptyToNull(parsed.categoria),
    observacoes: emptyToNull(parsed.observacoes),
    status: parsed.status,
  };

  if (parsed.id) {
    await prisma.receita.updateMany({ where: { id: parsed.id, usuarioId: userId }, data });
  } else {
    await prisma.receita.create({ data });
  }

  revalidateAllPages();
}

export async function deleteReceita(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const id = Number(formData.get("id"));
  await prisma.receita.deleteMany({ where: { id, usuarioId: userId } });
  revalidateAllPages();
}

export async function saveDespesa(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const parsed = despesaSchema.parse({
    id: formData.get("id") || undefined,
    descricao: formData.get("descricao"),
    valor: formData.get("valor"),
    dataVencimento: formData.get("dataVencimento"),
    dataPagamento: formData.get("dataPagamento"),
    categoria: formData.get("categoria"),
    observacoes: formData.get("observacoes"),
    status: formData.get("status"),
  });

  const data = {
    usuarioId: userId,
    descricao: parsed.descricao,
    valor: parseCurrencyToNumber(parsed.valor),
    dataVencimento: new Date(parsed.dataVencimento),
    dataPagamento: emptyToDate(parsed.dataPagamento),
    categoria: emptyToNull(parsed.categoria),
    observacoes: emptyToNull(parsed.observacoes),
    status: parsed.status,
  };

  if (parsed.id) {
    await prisma.despesa.updateMany({ where: { id: parsed.id, usuarioId: userId }, data });
  } else {
    await prisma.despesa.create({ data });
  }

  revalidateAllPages();
}

export async function deleteDespesa(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const id = Number(formData.get("id"));
  await prisma.despesa.deleteMany({ where: { id, usuarioId: userId } });
  revalidateAllPages();
}

export async function saveContaFixa(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const parsed = contaFixaSchema.parse({
    id: formData.get("id") || undefined,
    descricao: formData.get("descricao"),
    valorPrevisto: formData.get("valorPrevisto"),
    diaVencimento: formData.get("diaVencimento"),
    categoria: formData.get("categoria"),
    periodicidade: formData.get("periodicidade"),
    proximoVencimento: formData.get("proximoVencimento"),
    observacoes: formData.get("observacoes"),
    ativa: formData.get("ativa"),
  });

  const data = {
    usuarioId: userId,
    descricao: parsed.descricao,
    valorPrevisto: parseCurrencyToNumber(parsed.valorPrevisto),
    diaVencimento: parsed.diaVencimento,
    categoria: emptyToNull(parsed.categoria),
    periodicidade: parsed.periodicidade,
    proximoVencimento: emptyToDate(parsed.proximoVencimento),
    observacoes: emptyToNull(parsed.observacoes),
    ativa: parsed.ativa === "true",
  };

  if (parsed.id) {
    await prisma.contaFixa.updateMany({ where: { id: parsed.id, usuarioId: userId }, data });
  } else {
    await prisma.contaFixa.create({ data });
  }

  revalidateAllPages();
}

export async function deleteContaFixa(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const id = Number(formData.get("id"));
  await prisma.contaFixa.deleteMany({ where: { id, usuarioId: userId } });
  revalidateAllPages();
}

export async function saveCartao(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const parsed = cartaoSchema.parse({
    id: formData.get("id") || undefined,
    nome: formData.get("nome"),
    bandeira: formData.get("bandeira"),
    apelido: formData.get("apelido"),
    ultimosDigitos: formData.get("ultimosDigitos"),
    limite: formData.get("limite"),
    diaFechamento: formData.get("diaFechamento"),
    diaVencimento: formData.get("diaVencimento"),
    ativo: formData.get("ativo"),
  });

  const data = {
    usuarioId: userId,
    nome: parsed.nome,
    bandeira: emptyToNull(parsed.bandeira),
    apelido: emptyToNull(parsed.apelido),
    ultimosDigitos: parsed.ultimosDigitos,
    limite: emptyMoneyToNull(parsed.limite),
    diaFechamento: parsed.diaFechamento,
    diaVencimento: parsed.diaVencimento,
    ativo: parsed.ativo === "true",
  };

  if (parsed.id) {
    await prisma.cartao.updateMany({ where: { id: parsed.id, usuarioId: userId }, data });
  } else {
    await prisma.cartao.create({ data });
  }

  revalidateAllPages();
}

export async function deleteCartao(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const id = Number(formData.get("id"));
  await prisma.cartao.deleteMany({ where: { id, usuarioId: userId } });
  revalidateAllPages();
}

export async function saveFatura(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const parsed = faturaSchema.parse({
    id: formData.get("id") || undefined,
    cartaoId: formData.get("cartaoId"),
    competencia: formData.get("competencia"),
    dataFechamento: formData.get("dataFechamento"),
    dataVencimento: formData.get("dataVencimento"),
    valorTotal: formData.get("valorTotal"),
    valorPago: formData.get("valorPago"),
    status: formData.get("status"),
  });

  const data = {
    usuarioId: userId,
    cartaoId: parsed.cartaoId,
    competencia: parsed.competencia,
    dataFechamento: new Date(parsed.dataFechamento),
    dataVencimento: new Date(parsed.dataVencimento),
    valorTotal: parseCurrencyToNumber(parsed.valorTotal),
    valorPago: emptyMoneyToNull(parsed.valorPago) ?? 0,
    status: parsed.status,
  };

  if (parsed.id) {
    await prisma.faturaCartao.updateMany({ where: { id: parsed.id, usuarioId: userId }, data });
  } else {
    await prisma.faturaCartao.create({ data });
  }

  revalidateAllPages();
}

export async function deleteFatura(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const id = Number(formData.get("id"));
  await prisma.faturaCartao.deleteMany({ where: { id, usuarioId: userId } });
  revalidateAllPages();
}

export async function saveCompraCartao(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const parsed = compraCartaoSchema.parse({
    id: formData.get("id") || undefined,
    cartaoId: formData.get("cartaoId"),
    faturaId: formData.get("faturaId"),
    descricao: formData.get("descricao"),
    valor: formData.get("valor"),
    dataCompra: formData.get("dataCompra"),
    categoria: formData.get("categoria"),
    observacoes: formData.get("observacoes"),
    status: formData.get("status"),
  });

  const data = {
    usuarioId: userId,
    cartaoId: parsed.cartaoId,
    faturaId: parsed.faturaId ? Number(parsed.faturaId) : null,
    descricao: parsed.descricao,
    valor: parseCurrencyToNumber(parsed.valor),
    dataCompra: new Date(parsed.dataCompra),
    categoria: emptyToNull(parsed.categoria),
    observacoes: emptyToNull(parsed.observacoes),
    status: parsed.status,
  };

  if (parsed.id) {
    await prisma.compraCartao.updateMany({ where: { id: parsed.id, usuarioId: userId }, data });
  } else {
    await prisma.compraCartao.create({ data });
  }

  revalidateAllPages();
}

export async function deleteCompraCartao(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const id = Number(formData.get("id"));
  await prisma.compraCartao.deleteMany({ where: { id, usuarioId: userId } });
  revalidateAllPages();
}

export async function savePix(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const parsed = pixSchema.parse({
    id: formData.get("id") || undefined,
    tipo: formData.get("tipo"),
    valor: formData.get("valor"),
    dataPix: formData.get("dataPix"),
    descricao: formData.get("descricao"),
    conta: formData.get("conta"),
    categoria: formData.get("categoria"),
    observacoes: formData.get("observacoes"),
  });

  const data = {
    usuarioId: userId,
    tipo: parsed.tipo,
    valor: parseCurrencyToNumber(parsed.valor),
    dataPix: new Date(parsed.dataPix),
    descricao: parsed.descricao,
    conta: emptyToNull(parsed.conta),
    categoria: emptyToNull(parsed.categoria),
    observacoes: emptyToNull(parsed.observacoes),
  };

  if (parsed.id) {
    await prisma.pixTransacao.updateMany({ where: { id: parsed.id, usuarioId: userId }, data });
  } else {
    await prisma.pixTransacao.create({ data });
  }

  revalidateAllPages();
}

export async function deletePix(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const id = Number(formData.get("id"));
  await prisma.pixTransacao.deleteMany({ where: { id, usuarioId: userId } });
  revalidateAllPages();
}

export async function saveRecebivel(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const parsed = recebivelSchema.parse({
    id: formData.get("id") || undefined,
    descricao: formData.get("descricao"),
    valorPrevisto: formData.get("valorPrevisto"),
    dataEsperada: formData.get("dataEsperada"),
    dataRecebimento: formData.get("dataRecebimento"),
    origem: formData.get("origem"),
    categoria: formData.get("categoria"),
    observacoes: formData.get("observacoes"),
    status: formData.get("status"),
  });

  const data = {
    usuarioId: userId,
    descricao: parsed.descricao,
    valorPrevisto: parseCurrencyToNumber(parsed.valorPrevisto),
    dataEsperada: new Date(parsed.dataEsperada),
    dataRecebimento: emptyToDate(parsed.dataRecebimento),
    origem: emptyToNull(parsed.origem),
    categoria: emptyToNull(parsed.categoria),
    observacoes: emptyToNull(parsed.observacoes),
    status: parsed.status,
  };

  if (parsed.id) {
    await prisma.recebivel.updateMany({ where: { id: parsed.id, usuarioId: userId }, data });
  } else {
    await prisma.recebivel.create({ data });
  }

  revalidateAllPages();
}

export async function deleteRecebivel(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const id = Number(formData.get("id"));
  await prisma.recebivel.deleteMany({ where: { id, usuarioId: userId } });
  revalidateAllPages();
}
