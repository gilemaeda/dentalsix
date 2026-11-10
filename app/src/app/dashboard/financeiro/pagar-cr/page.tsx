"use client";

import { useState, useEffect, useCallback } from "react";

interface PagarCR {
  id_cpagar_cr: number;
  id_cpagar_db: number | null;
  dt_pagto: string | null;
  vl_pagamento: string | null;
  vl_desconto: string | null;
  vl_multa: string | null;
  vl_mora: string | null;
  id_tipo_pagto: string | null;
  tx_historico: string | null;
}

export default function PagarCRPage() {
  const [pagamentos, setPagamentos] = useState<PagarCR[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id_cpagar_db: "",
    dt_pagto: "",
    vl_pagamento: "",
    vl_desconto: "",
    vl_multa: "",
    vl_mora: "",
    id_tipo_pagto: "",
    tx_historico: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/financeiro/pagar-cr");
      if (res.ok) {
        const data = await res.json();
        setPagamentos(data.pagamentos);
        setTotal(data.total);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/financeiro/pagar-cr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cpagar_db: form.id_cpagar_db ? parseInt(form.id_cpagar_db) : null,
          dt_pagto: form.dt_pagto || null,
          vl_pagamento: form.vl_pagamento ? parseFloat(form.vl_pagamento) : null,
          vl_desconto: form.vl_desconto ? parseFloat(form.vl_desconto) : 0,
          vl_multa: form.vl_multa ? parseFloat(form.vl_multa) : 0,
          vl_mora: form.vl_mora ? parseFloat(form.vl_mora) : 0,
          id_tipo_pagto: form.id_tipo_pagto || null,
          tx_historico: form.tx_historico || null,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ id_cpagar_db: "", dt_pagto: "", vl_pagamento: "", vl_desconto: "", vl_multa: "", vl_mora: "", id_tipo_pagto: "", tx_historico: "" });
        fetchData();
      }
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  const fmt = (v: string | null) =>
    v ? parseFloat(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";
  const fmtDate = (v: string | null) =>
    v ? new Date(v).toLocaleDateString("pt-BR") : "—";

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Pagamentos - Contas a Pagar ({total})</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary/90">
          Novo Pagamento
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Data Pagto</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Valor</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Desconto</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Multa</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Mora</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Tipo Pagto</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Histórico</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">Carregando...</td></tr>
            ) : pagamentos.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">Nenhum pagamento encontrado</td></tr>
            ) : (
              pagamentos.map((p) => (
                <tr key={p.id_cpagar_cr} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">{fmtDate(p.dt_pagto)}</td>
                  <td className="px-4 py-2 text-right font-medium">{fmt(p.vl_pagamento)}</td>
                  <td className="px-4 py-2 text-right text-green-600">{fmt(p.vl_desconto)}</td>
                  <td className="px-4 py-2 text-right text-red-500">{fmt(p.vl_multa)}</td>
                  <td className="px-4 py-2 text-right text-red-500">{fmt(p.vl_mora)}</td>
                  <td className="px-4 py-2">{p.id_tipo_pagto || "—"}</td>
                  <td className="px-4 py-2 text-gray-500 truncate max-w-[200px]">{p.tx_historico || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800">Novo Pagamento</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ID Despesa *</label>
                  <input type="number" required value={form.id_cpagar_db} onChange={(e) => setForm({ ...form, id_cpagar_db: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Data Pagamento</label>
                  <input type="date" value={form.dt_pagto} onChange={(e) => setForm({ ...form, dt_pagto: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Valor Pagamento *</label>
                  <input type="number" step="0.01" required value={form.vl_pagamento} onChange={(e) => setForm({ ...form, vl_pagamento: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Desconto</label>
                  <input type="number" step="0.01" value={form.vl_desconto} onChange={(e) => setForm({ ...form, vl_desconto: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Multa</label>
                  <input type="number" step="0.01" value={form.vl_multa} onChange={(e) => setForm({ ...form, vl_multa: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mora</label>
                  <input type="number" step="0.01" value={form.vl_mora} onChange={(e) => setForm({ ...form, vl_mora: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo Pagamento</label>
                <select value={form.id_tipo_pagto} onChange={(e) => setForm({ ...form, id_tipo_pagto: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm">
                  <option value="">Selecione...</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="Transferência">Transferência</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cartão débito">Cartão débito</option>
                  <option value="Cartão crédito">Cartão crédito</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Histórico</label>
                <textarea value={form.tx_historico} onChange={(e) => setForm({ ...form, tx_historico: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" rows={2} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
