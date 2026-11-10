"use client";

import { useState, useEffect, useCallback } from "react";

interface Despesa {
  id_cpagar_db: number;
  dt_vencimento: string;
  tx_historico: string | null;
  tx_documento: string | null;
  vl_despesa: string;
  vl_pago: string;
  id_tipo_despesa: string | null;
  id_tipo_pagto: string | null;
  fl_pago: boolean;
  fornecedor?: { tx_nome: string } | null;
  categoria?: { tx_descricao: string } | null;
  contaBancaria?: { tx_nome_conta: string } | null;
}

export default function PagarPage() {
  const [contas, setContas] = useState<Despesa[]>([]);
  const [total, setTotal] = useState(0);
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id_tipo_despesa: "Despesas gerais",
    dt_vencimento: "",
    tx_documento: "",
    tx_historico: "",
    vl_despesa: "",
    id_tipo_pagto: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (de) params.set("de", de);
      if (ate) params.set("ate", ate);
      const res = await fetch(`/api/financeiro/pagar?${params}`);
      if (res.ok) {
        const data = await res.json();
        setContas(data.contas);
        setTotal(data.total);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [de, ate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/financeiro/pagar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, vl_despesa: parseFloat(form.vl_despesa) }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ id_tipo_despesa: "Despesas gerais", dt_vencimento: "", tx_documento: "", tx_historico: "", vl_despesa: "", id_tipo_pagto: "" });
        fetchData();
      }
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  function formatMoney(val: string) {
    return parseFloat(val).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Contas a Pagar</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors"
        >
          Nova despesa
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200 flex flex-wrap items-center gap-3">
          <input type="date" value={de} onChange={(e) => setDe(e.target.value)}
            className="px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <span className="text-gray-400 text-sm">até</span>
          <input type="date" value={ate} onChange={(e) => setAte(e.target.value)}
            className="px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Fornecedor/Creditado</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Categoria</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Descrição</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Documento</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase text-right">Valor</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase text-right">Valor pago</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Pago</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td></tr>
              ) : contas.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  <p className="text-sm">Nenhuma conta a pagar encontrada</p>
                </td></tr>
              ) : contas.map((c) => (
                <tr key={c.id_cpagar_db} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-4 py-2.5 text-sm text-gray-600">{formatDate(c.dt_vencimento)}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{c.fornecedor?.tx_nome || "—"}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{c.categoria?.tx_descricao || "—"}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{c.tx_historico || "—"}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell">{c.tx_documento || "—"}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-800 font-medium text-right">R$ {formatMoney(c.vl_despesa)}</td>
                  <td className="px-4 py-2.5 text-sm text-green-700 text-right">R$ {formatMoney(c.vl_pago)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.fl_pago ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {c.fl_pago ? "Pago" : "Em aberto"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-200 text-xs text-gray-500">
            {total} conta{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Nova Despesa</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de despesa</label>
                <select value={form.id_tipo_despesa} onChange={(e) => setForm({ ...form, id_tipo_despesa: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                  <option value="Despesas gerais">Despesas gerais</option>
                  <option value="Material de consumo">Material de consumo</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Folha de pagamento">Folha de pagamento</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento *</label>
                  <input type="date" required value={form.dt_vencimento}
                    onChange={(e) => setForm({ ...form, dt_vencimento: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nº do documento</label>
                  <input type="text" value={form.tx_documento}
                    onChange={(e) => setForm({ ...form, tx_documento: e.target.value })}
                    placeholder="Nota fiscal ou recibo"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input type="text" value={form.tx_historico}
                  onChange={(e) => setForm({ ...form, tx_historico: e.target.value })}
                  placeholder="Descrição da despesa"
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor da despesa *</label>
                  <input type="number" step="0.01" required value={form.vl_despesa}
                    onChange={(e) => setForm({ ...form, vl_despesa: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pagamento</label>
                  <select value={form.id_tipo_pagto} onChange={(e) => setForm({ ...form, id_tipo_pagto: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                    <option value="">Selecione</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão crédito">Cartão crédito</option>
                    <option value="PIX">PIX</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors disabled:opacity-50">
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
