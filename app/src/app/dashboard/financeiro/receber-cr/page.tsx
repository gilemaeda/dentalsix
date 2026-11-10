"use client";

import { useState, useEffect, useCallback } from "react";

interface ReceberCR {
  id_creceber_cr: number;
  dt_pagto: string;
  tx_paciente: string | null;
  tx_tratamento: string | null;
  vl_pagamento: number | null;
  vl_credito: number | null;
  vl_desconto: number | null;
  tx_tipo_pagto: string | null;
  tx_conta_credito: string | null;
  tx_historico: string | null;
  tx_nr_recibo: string | null;
  fl_ativo: boolean;
}

export default function ReceberCRPage() {
  const [creditos, setCreditos] = useState<ReceberCR[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id_creceber_db: "",
    dt_pagto: "",
    id_cpagar_conta: "",
    id_tipo_pagto: "",
    vl_credito: "",
    vl_desconto: "",
    vl_multa: "",
    vl_mora: "",
    tx_historico: "",
  });

  const fetchCreditos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/financeiro/receber-cr?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCreditos(data.creditos || []);
        setTotal(data.total || 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => {
    const timer = setTimeout(fetchCreditos, 300);
    return () => clearTimeout(timer);
  }, [fetchCreditos]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/financeiro/receber-cr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id_creceber_db: form.id_creceber_db ? Number(form.id_creceber_db) : null,
          id_cpagar_conta: form.id_cpagar_conta ? Number(form.id_cpagar_conta) : null,
          id_tipo_pagto: form.id_tipo_pagto ? Number(form.id_tipo_pagto) : null,
          vl_credito: form.vl_credito ? Number(form.vl_credito) : 0,
          vl_desconto: form.vl_desconto ? Number(form.vl_desconto) : 0,
          vl_multa: form.vl_multa ? Number(form.vl_multa) : 0,
          vl_mora: form.vl_mora ? Number(form.vl_mora) : 0,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ id_creceber_db: "", dt_pagto: "", id_cpagar_conta: "", id_tipo_pagto: "", vl_credito: "", vl_desconto: "", vl_multa: "", vl_mora: "", tx_historico: "" });
        fetchCreditos();
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
        <h1 className="text-lg font-semibold text-gray-800">Recebimentos (Créditos)</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors"
        >
          Novo Crédito
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por paciente, tratamento ou histórico..."
            className="w-full sm:w-80 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Data Pagto</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Tratamento</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Valor</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tipo Pagto</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Conta</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td>
                </tr>
              ) : creditos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" />
                    </svg>
                    <p className="text-sm">Nenhum crédito registrado</p>
                    <p className="text-xs mt-1">Clique em &quot;Novo Crédito&quot; para registrar um pagamento</p>
                  </td>
                </tr>
              ) : (
                creditos.map((c) => (
                  <tr key={c.id_creceber_cr} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-800">{new Date(c.dt_pagto).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 font-medium">{c.tx_paciente || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{c.tx_tratamento || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-green-600 font-medium">{formatCurrency(c.vl_credito)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell">{c.tx_tipo_pagto || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell">{c.tx_conta_credito || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-200 text-xs text-gray-500">
            {total} crédito{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Novo Crédito</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Débito (Receber) *</label>
                  <input type="number" required value={form.id_creceber_db} onChange={(e) => setForm({ ...form, id_creceber_db: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Pagamento *</label>
                  <input type="date" required value={form.dt_pagto} onChange={(e) => setForm({ ...form, dt_pagto: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Crédito *</label>
                  <input type="number" step="0.01" required value={form.vl_credito} onChange={(e) => setForm({ ...form, vl_credito: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
                  <input type="number" step="0.01" value={form.vl_desconto} onChange={(e) => setForm({ ...form, vl_desconto: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Multa</label>
                  <input type="number" step="0.01" value={form.vl_multa} onChange={(e) => setForm({ ...form, vl_multa: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mora</label>
                  <input type="number" step="0.01" value={form.vl_mora} onChange={(e) => setForm({ ...form, vl_mora: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Conta Bancária</label>
                  <input type="number" value={form.id_cpagar_conta} onChange={(e) => setForm({ ...form, id_cpagar_conta: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Tipo Pagamento</label>
                  <input type="number" value={form.id_tipo_pagto} onChange={(e) => setForm({ ...form, id_tipo_pagto: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
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
