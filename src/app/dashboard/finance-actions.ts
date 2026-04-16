"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCurrentUser } from "@/lib/auth";
import { addMonths, parseCurrencyToNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import {
  cartaoSchema,
  categoriaDespesaSchema,
  contaFixaSchema,
  compraCartaoSchema,
  despesaSchema,
  faturaSchema,
  pixSchema,
  recebivelSchema,
  receitaSchema,
} from "@/lib/validations/finance";

const idSchema = z.coerce.number().int().positive();

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

function parseRequiredId(formData: FormData) {
  return idSchema.parse(formData.get("id"));
}

function revalidateAllPages() {
  [
    "/dashboard",
    "/dashboard/relatorios",
    "/dashboard/receitas",
    "/dashboard/despesas",
    "/dashboard/categorias",
    "/dashboard/contas-fixas",
    "/dashboard/cartoes",
    "/dashboard/compras-cartao",
    "/dashboard/faturas",
    "/dashboard/pix",
    "/dashboard/recebiveis",
  ].forEach((path) => revalidatePath(path));
}

async function ensureTagExists(tagId: number) {
  const tag = await prisma.tag.findUnique({ where: { id: tagId }, select: { id: true } });

  if (!tag) {
    throw new Error("Selecione uma tag valida.");
  }
}

export async function saveReceita(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const parsed = receitaSchema.parse({
    id: formData.get("id") || undefined,
    descricao: formData.get("descricao"),
    valor: formData.get("valor"),
    dataRecebimento: formData.get("dataRecebimento"),
    tagId: formData.get("tagId"),
    quantidadeParcelas: formData.get("quantidadeParcelas"),
    observacoes: formData.get("observacoes"),
  });

  await ensureTagExists(parsed.tagId);

  const baseDate = new Date(parsed.dataRecebimento);
  const baseData = {
    usuarioId: userId,
    descricao: parsed.descricao,
    valor: parseCurrencyToNumber(parsed.valor),
    tagId: parsed.tagId,
    observacoes: emptyToNull(parsed.observacoes),
    status: "prevista",
  };

  if (parsed.id) {
    await prisma.receita.updateMany({
      where: { id: parsed.id, usuarioId: userId },
      data: { ...baseData, dataRecebimento: baseDate },
    });
  } else {
    await prisma.receita.createMany({
      data: Array.from({ length: parsed.quantidadeParcelas }, (_, index) => ({
        ...baseData,
        dataRecebimento: addMonths(baseDate, index),
      })),
    });
  }

  revalidateAllPages();
}

export async function deleteReceita(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const id = parseRequiredId(formData);
  await prisma.receita.deleteMany({ where: { id, usuarioId: userId } });
  revalidateAllPages();
}

export async function saveCategoriaDespesa(formData: FormData) {
  await requireCurrentUser();
  const parsed = categoriaDespesaSchema.parse({
    id: formData.get("id") || undefined,
    nome: formData.get("nome"),
    dataInicio: formData.get("dataInicio"),
    dataFim: formData.get("dataFim"),
    observacoes: formData.get("observacoes"),
    usuariosIds: formData.getAll("usuariosIds"),
  });

  const activeUsers = await prisma.usuario.findMany({
    where: {
      ativo: true,
      id: { in: parsed.usuariosIds },
      pessoa: { ativo: true },
    },
    select: { id: true },
  });

  if (activeUsers.length !== parsed.usuariosIds.length) {
    throw new Error("Selecione apenas usuarios ativos para a categoria.");
  }

  const data = {
    nome: parsed.nome,
    dataInicio: new Date(parsed.dataInicio),
    dataFim: emptyToDate(parsed.dataFim),
    observacoes: emptyToNull(parsed.observacoes),
  };

  if (parsed.id) {
    await prisma.$transaction(async (tx) => {
      await tx.categoriaDespesa.update({
        where: { id: parsed.id },
        data,
      });

      await tx.categoriaDespesaUsuario.deleteMany({ where: { categoriaId: parsed.id } });
      await tx.categoriaDespesaUsuario.createMany({
        data: parsed.usuariosIds.map((usuarioId) => ({ categoriaId: parsed.id!, usuarioId })),
      });
    });
  } else {
    await prisma.$transaction(async (tx) => {
      const categoria = await tx.categoriaDespesa.create({ data, select: { id: true } });
      await tx.categoriaDespesaUsuario.createMany({
        data: parsed.usuariosIds.map((usuarioId) => ({ categoriaId: categoria.id, usuarioId })),
      });
    });
  }

  revalidateAllPages();
}

export async function deleteCategoriaDespesa(formData: FormData) {
  await requireCurrentUser();
  const id = parseRequiredId(formData);

  const totalDespesas = await prisma.despesa.count({ where: { categoriaDespesaId: id } });

  if (totalDespesas > 0) {
    throw new Error("Nao e possivel excluir uma categoria que ja esta vinculada a despesas.");
  }

  await prisma.categoriaDespesa.delete({ where: { id } });
  revalidateAllPages();
}

export async function saveDespesa(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const parsed = despesaSchema.parse({
    id: formData.get("id") || undefined,
    descricao: formData.get("descricao"),
    valor: formData.get("valor"),
    dataVencimento: formData.get("dataVencimento"),
    categoriaId: formData.get("categoriaId"),
    tagId: formData.get("tagId"),
    formaPagamento: formData.get("formaPagamento"),
    meioPagamento: formData.get("meioPagamento"),
    cartaoId: formData.get("cartaoId"),
    quantidadeParcelas: formData.get("quantidadeParcelas"),
    observacoes: formData.get("observacoes"),
  });

  const [categoriaPermitida, tag, cartao] = await Promise.all([
    prisma.categoriaDespesa.findFirst({
      where: {
        id: parsed.categoriaId,
        usuarios: {
          some: {
            usuarioId: userId,
          },
        },
      },
      select: { id: true },
    }),
    prisma.tag.findUnique({ where: { id: parsed.tagId }, select: { id: true } }),
    parsed.formaPagamento === "a_prazo" && parsed.cartaoId
      ? prisma.cartao.findFirst({
          where: { id: Number(parsed.cartaoId), usuarioId: userId, ativo: true },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  if (!categoriaPermitida) {
    throw new Error("Selecione uma categoria vinculada ao usuario atual.");
  }

  if (!tag) {
    throw new Error("Selecione uma tag valida.");
  }

  if (parsed.formaPagamento === "a_prazo" && !cartao) {
    throw new Error("Selecione um cartao ativo do usuario atual.");
  }

  const baseDueDate = new Date(parsed.dataVencimento);
  const baseData = {
    usuarioId: userId,
    categoriaDespesaId: parsed.categoriaId,
    tagId: parsed.tagId,
    descricao: parsed.descricao,
    valor: parseCurrencyToNumber(parsed.valor),
    formaPagamento: parsed.formaPagamento,
    meioPagamento: parsed.formaPagamento === "a_vista" ? parsed.meioPagamento : null,
    cartaoId: parsed.formaPagamento === "a_prazo" && parsed.cartaoId ? Number(parsed.cartaoId) : null,
    observacoes: emptyToNull(parsed.observacoes),
    status: "pendente",
  };

  if (parsed.id) {
    await prisma.despesa.updateMany({
      where: { id: parsed.id, usuarioId: userId },
      data: {
        ...baseData,
        dataVencimento: baseDueDate,
      },
    });
  } else {
    await prisma.despesa.createMany({
      data: Array.from({ length: parsed.quantidadeParcelas }, (_, index) => ({
        ...baseData,
        dataVencimento: addMonths(baseDueDate, index),
      })),
    });
  }

  revalidateAllPages();
}

export async function deleteDespesa(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const id = parseRequiredId(formData);
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
  const id = parseRequiredId(formData);
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
  const id = parseRequiredId(formData);
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

  const valorPago = emptyMoneyToNull(parsed.valorPago) ?? 0;
  const valorTotal = parseCurrencyToNumber(parsed.valorTotal);

  if (valorPago > valorTotal) {
    throw new Error("Valor pago nao pode ser maior que o valor total da fatura.");
  }

  const data = {
    usuarioId: userId,
    cartaoId: parsed.cartaoId,
    competencia: parsed.competencia,
    dataFechamento: new Date(parsed.dataFechamento),
    dataVencimento: new Date(parsed.dataVencimento),
    valorTotal,
    valorPago,
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
  const id = parseRequiredId(formData);
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
  const id = parseRequiredId(formData);
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
  const id = parseRequiredId(formData);
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
  const id = parseRequiredId(formData);
  await prisma.recebivel.deleteMany({ where: { id, usuarioId: userId } });
  revalidateAllPages();
}
