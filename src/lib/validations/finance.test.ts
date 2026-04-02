import { describe, expect, it } from "vitest";

import { categoriaDespesaSchema, despesaSchema, faturaSchema, pixSchema, recebivelSchema, receitaSchema } from "@/lib/validations/finance";

describe("finance validations", () => {
  it("aceita payload valido de categoria de despesa", () => {
    const parsed = categoriaDespesaSchema.parse({
      nome: "Apartamento",
      dataInicio: "2026-03-24",
      dataFim: "2026-12-31",
      observacoes: "Categoria principal de moradia",
      usuariosIds: [1, 3],
    });

    expect(parsed.usuariosIds).toHaveLength(2);
  });

  it("rejeita categoria sem usuarios", () => {
    const result = categoriaDespesaSchema.safeParse({
      nome: "Apartamento",
      dataInicio: "2026-03-24",
      dataFim: "",
      observacoes: "",
      usuariosIds: [],
    });

    expect(result.success).toBe(false);
  });

  it("aceita receita com tag obrigatoria", () => {
    const parsed = receitaSchema.parse({
      descricao: "Salario",
      valor: "4500.00",
      dataRecebimento: "2026-03-24",
      categoria: "Salario",
      tagId: 2,
      quantidadeParcelas: 3,
      observacoes: "",
      status: "recebida",
    });

    expect(parsed.tagId).toBe(2);
    expect(parsed.quantidadeParcelas).toBe(3);
  });

  it("assume 1 parcela quando o campo nao vem no formulario de receita", () => {
    const parsed = receitaSchema.parse({
      descricao: "Salario",
      valor: "4500.00",
      dataRecebimento: "2026-03-24",
      categoria: "Salario",
      tagId: 2,
      quantidadeParcelas: null,
      observacoes: "",
      status: "recebida",
    });

    expect(parsed.quantidadeParcelas).toBe(1);
  });

  it("rejeita receita sem tag", () => {
    const result = receitaSchema.safeParse({
      descricao: "Salario",
      valor: "4500.00",
      dataRecebimento: "2026-03-24",
      categoria: "Salario",
      tagId: "",
      observacoes: "",
      status: "recebida",
    });

    expect(result.success).toBe(false);
  });

  it("aceita valor com mascara brasileira", () => {
    const parsed = despesaSchema.parse({
      descricao: "Aluguel",
      valor: "1.500,00",
      dataVencimento: "2026-03-24",
      dataPagamento: "",
      categoriaId: 1,
      tagId: 3,
      formaPagamento: "a_vista",
      meioPagamento: "dinheiro",
      cartaoId: "",
      quantidadeParcelas: 1,
      observacoes: "",
      status: "pendente",
    });

    expect(parsed.valor).toBe("1.500,00");
  });

  it("aceita despesa a vista com dinheiro", () => {
    const parsed = despesaSchema.parse({
      descricao: "Aluguel",
      valor: "1500.00",
      dataVencimento: "2026-03-24",
      dataPagamento: "",
      categoriaId: 1,
      tagId: 3,
      formaPagamento: "a_vista",
      meioPagamento: "dinheiro",
      cartaoId: "",
      quantidadeParcelas: 5,
      observacoes: "",
      status: "pendente",
    });

    expect(parsed.formaPagamento).toBe("a_vista");
    expect(parsed.meioPagamento).toBe("dinheiro");
    expect(parsed.quantidadeParcelas).toBe(5);
  });

  it("aceita despesa a prazo com cartao", () => {
    const parsed = despesaSchema.parse({
      descricao: "Notebook",
      valor: "3500.00",
      dataVencimento: "2026-03-24",
      dataPagamento: "",
      categoriaId: 1,
      tagId: 3,
      formaPagamento: "a_prazo",
      meioPagamento: "",
      cartaoId: "7",
      quantidadeParcelas: 7,
      observacoes: "",
      status: "pendente",
    });

    expect(parsed.formaPagamento).toBe("a_prazo");
    expect(parsed.cartaoId).toBe("7");
    expect(parsed.quantidadeParcelas).toBe(7);
  });

  it("aceita despesa a prazo quando meio de pagamento nao vem no form", () => {
    const parsed = despesaSchema.parse({
      descricao: "Notebook",
      valor: "3500.00",
      dataVencimento: "2026-03-24",
      dataPagamento: "",
      categoriaId: 1,
      tagId: 3,
      formaPagamento: "a_prazo",
      meioPagamento: null,
      cartaoId: "7",
      quantidadeParcelas: null,
      observacoes: "",
      status: "pendente",
    });

    expect(parsed.formaPagamento).toBe("a_prazo");
    expect(parsed.meioPagamento).toBeNull();
    expect(parsed.quantidadeParcelas).toBe(1);
  });

  it("rejeita despesa a vista sem meio de pagamento", () => {
    const result = despesaSchema.safeParse({
      descricao: "Aluguel",
      valor: "1500.00",
      dataVencimento: "2026-03-24",
      dataPagamento: "",
      categoriaId: 1,
      tagId: 3,
      formaPagamento: "a_vista",
      meioPagamento: "",
      cartaoId: "",
      observacoes: "",
      status: "pendente",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita despesa a prazo sem cartao", () => {
    const result = despesaSchema.safeParse({
      descricao: "Notebook",
      valor: "3500.00",
      dataVencimento: "2026-03-24",
      dataPagamento: "",
      categoriaId: 1,
      tagId: 3,
      formaPagamento: "a_prazo",
      meioPagamento: "",
      cartaoId: "",
      observacoes: "",
      status: "pendente",
    });

    expect(result.success).toBe(false);
  });

  it("aceita payload valido de PIX", () => {
    const parsed = pixSchema.parse({
      tipo: "recebido",
      valor: "150.90",
      dataPix: "2026-03-24",
      descricao: "PIX cliente",
      conta: "Conta principal",
      categoria: "Transferencia",
      observacoes: "",
    });

    expect(parsed.tipo).toBe("recebido");
  });

  it("rejeita valor zerado", () => {
    const result = pixSchema.safeParse({
      tipo: "recebido",
      valor: "0",
      dataPix: "2026-03-24",
      descricao: "PIX cliente",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita fatura com competencia invalida", () => {
    const result = faturaSchema.safeParse({
      cartaoId: 1,
      competencia: "03/2026",
      dataFechamento: "2026-03-10",
      dataVencimento: "2026-03-20",
      valorTotal: "1500.00",
      valorPago: "0",
      status: "aberta",
    });

    expect(result.success).toBe(false);
  });

  it("aceita recebivel valido", () => {
    const parsed = recebivelSchema.parse({
      descricao: "Projeto mensal",
      valorPrevisto: "4500.00",
      dataEsperada: "2026-03-30",
      dataRecebimento: "",
      origem: "Cliente A",
      categoria: "Servico",
      observacoes: "",
      status: "pendente",
    });

    expect(parsed.status).toBe("pendente");
  });
});
