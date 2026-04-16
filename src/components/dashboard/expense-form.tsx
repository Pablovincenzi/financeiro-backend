"use client";

import { useState } from "react";

import { MoneyInput } from "@/components/dashboard/money-input";

type Option = {
  id: number;
  nome: string;
};

type ExpenseFormProps = {
  expense?: {
    id?: number;
    descricao?: string;
    valor?: number;
    dataVencimento?: string;
    categoriaId?: number;
    tagId?: number | null;
    formaPagamento?: string;
    meioPagamento?: string | null;
    cartaoId?: number | null;
    observacoes?: string | null;
  } | null;
  categorias: Option[];
  tags: Option[];
  cartoes: Option[];
  action: (formData: FormData) => void;
};

export function ExpenseForm({ expense, categorias, tags, cartoes, action }: ExpenseFormProps) {
  const [formaPagamento, setFormaPagamento] = useState(expense?.formaPagamento ?? "a_vista");
  const isEditing = Boolean(expense?.id);

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="id" value={expense?.id ?? ""} />

      <div>
        <label className="mb-2 block text-sm font-medium">Descricao</label>
        <input name="descricao" defaultValue={expense?.descricao ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Categoria</label>
        <select name="categoriaId" defaultValue={expense?.categoriaId ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required>
          <option value="" disabled>Selecione uma categoria</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Valor</label>
          <MoneyInput name="valor" defaultValue={expense?.valor ?? ""} required />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Data de vencimento</label>
          <input type="date" name="dataVencimento" defaultValue={expense?.dataVencimento ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Tag</label>
        <select name="tagId" defaultValue={expense?.tagId ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required>
          <option value="" disabled>Selecione uma tag</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>{tag.nome}</option>
          ))}
        </select>
      </div>

      {!isEditing ? (
        <div>
          <label className="mb-2 block text-sm font-medium">Quantidade de parcelas</label>
          <input type="number" name="quantidadeParcelas" min="1" max="120" defaultValue="1" className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required />
          <p className="mt-2 text-xs text-muted">Se informar mais de 1, o sistema criara despesas mensais futuras com a mesma configuracao.</p>
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-medium">Forma de pagamento</label>
        <select
          name="formaPagamento"
          value={formaPagamento}
          onChange={(event) => setFormaPagamento(event.target.value)}
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent"
          required
        >
          <option value="a_vista">A vista</option>
          <option value="a_prazo">A prazo</option>
        </select>
      </div>

      {formaPagamento === "a_vista" ? (
        <div>
          <label className="mb-2 block text-sm font-medium">Pagamento a vista</label>
          <select name="meioPagamento" defaultValue={expense?.meioPagamento ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required>
            <option value="" disabled>Selecione uma opcao</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="pix">PIX</option>
          </select>
        </div>
      ) : (
        <div>
          <label className="mb-2 block text-sm font-medium">Cartao</label>
          <select name="cartaoId" defaultValue={expense?.cartaoId ?? ""} className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" required>
            <option value="" disabled>Selecione um cartao</option>
            {cartoes.map((cartao) => (
              <option key={cartao.id} value={cartao.id}>{cartao.nome}</option>
            ))}
          </select>
          {cartoes.length === 0 ? <p className="mt-2 text-xs text-muted">Cadastre um cartao antes de lancar despesas a prazo.</p> : null}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium">Observacoes</label>
        <textarea name="observacoes" defaultValue={expense?.observacoes ?? ""} className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
      </div>

      <button className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong">
        {expense?.id ? "Salvar alteracoes" : "Cadastrar despesa"}
      </button>
    </form>
  );
}
