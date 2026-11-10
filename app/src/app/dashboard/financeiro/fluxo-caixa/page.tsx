"use client";

import { useState, useEffect, useCallback } from "react";

interface FluxoCaixa {
  id_lancamento: number;
  dt_lancamento: string;
  tx_nome_conta: string | null;
  tx_categoria_conta: string | null;
  cd_tipo_pagto: string | null;
  vl_valor: number;
  vl_saldo: number;
  tx_historico: string | null;
  tx_nome_pagante_creditado: string | null;
  fl_ativo: boolean;
}

export default function FluxoCaixaPage() {
  const [lancamentos, setLancamentos] = useState<FluxoCaixa[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    dt_lancamento: "",
    id_cpagar_conta: "",
    id_categoria_conta: "",
    cd_tipo_pagto: "",
    vl_valor: "",
    tx_historico: "",
    tx_nome_pagante_creditado: "",
  });

  const fetchLancamentos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/financeiro/fluxo-caixa?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLancamentos(data.lancamentos || []);
        setTotal(data.total || 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => {
    const timer = setTimeout(fetchLancamentos, 300);
    return () => clearTimeout(timer);
  }, [fetchLancamentos]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/financeiro/fluxo-caixa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id_cpagar_conta: form.id_cpagar_conta ? Number(form.id_cpagar_conta) : null,
          id_categoria_conta: form.id_categoria_conta ? Number(form.id_categoria_conta) : null,
          vl_valor: form.vl_valor ? Number(form.vl_valor) : 0,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ dt_lancamento: "", id_cpagar_conta: "", id_categoria_conta: "", cd_tipo_pagto: "", vl_valor: "", tx_historico: "", tx_nome_pagante_creditado: "" });
        fetchLancamentos();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  function formatCurrency(val: number | null) {
    if (val == null) return "—";
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Fluxo de Caixa</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors"
        >
          Novo Lançamento
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por histórico, conta ou pagante..."
            className="w-full sm:w-80 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Conta</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tipo Pagto</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Valor</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Saldo</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Histórico</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td>
                </tr>
              ) : lancamentos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" />
                    </svg>
                    <p className="text-sm">Nenhum lançamento encontrado</p>
                    <p className="text-xs mt-1">Clique em &quot;Novo Lançamento&quot; para começar</p>
                  </td>
                </tr>
              ) : (
                lancamentos.map((l) => (
                  <tr key={l.id_lancamento} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-800">{new Date(l.dt_lancamento).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{l.tx_nome_conta || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{l.tx_categoria_conta || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell">{l.cd_tipo_pagto || "—"}</td>
                    <td className={`px-4 py-2.5 text-sm text-right font-medium ${l.vl_valor >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(l.vl_valor)}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-gray-800 font-medium">{formatCurrency(l.vl_saldo)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden xl:table-cell truncate max-w-[200px]">{l.tx_historico || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-200 text-xs text-gray-500">
            {total} lançamento{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Novo Lançamento</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                  <input type="date" required value={form.dt_lancamento} onChange={(e) => setForm({ ...form, dt_lancamento: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                  <input type="number" step="0.01" required value={form.vl_valor} onChange={(e) => setForm({ ...form, vl_valor: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Conta Bancária</label>
                  <input type="number" value={form.id_cpagar_conta} onChange={(e) => setForm({ ...form, id_cpagar_conta: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Categoria</label>
                  <input type="number" value={form.id_categoria_conta} onChange={(e) => setForm({ ...form, id_categoria_conta: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Pagamento</label>
                <select value={form.cd_tipo_pagto} onChange={(e) => setForm({ ...form, cd_tipo_pagto: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm">
                  <option value="">Selecione</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="CARTAO_CREDITO">Cartão Crédito</option>
                  <option value="CARTAO_DEBITO">Cartão Débito</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pagante / Creditado</label>
                <input type="text" value={form.tx_nome_pagante_creditado} onChange={(e) => setForm({ ...form, tx_nome_pagante_creditado: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Histórico</label>
                <textarea value={form.tx_historico} onChange={(e) => setForm({ ...form, tx_historico: e.target.value })} rows={2} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
