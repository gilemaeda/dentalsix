"use client";

import { useState, useEffect, useCallback } from "react";

interface Repasse {
  id_repasse: number;
  id_prestador: number | null;
  dt_periodo_inicio: string | null;
  dt_periodo_fim: string | null;
  vl_bruto: string | null;
  vl_desconto: string | null;
  vl_total: string | null;
  dt_efetivacao: string | null;
  tx_observacoes: string | null;
}

export default function RepassesPage() {
  const [repasses, setRepasses] = useState<Repasse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id_prestador: "",
    dt_periodo_inicio: "",
    dt_periodo_fim: "",
    vl_bruto: "",
    vl_desconto: "",
    tx_observacoes: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/repasses");
      if (res.ok) {
        const data = await res.json();
        setRepasses(data.repasses);
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
      const res = await fetch("/api/repasses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id_prestador: form.id_prestador ? parseInt(form.id_prestador) : null,
          vl_bruto: form.vl_bruto ? parseFloat(form.vl_bruto) : null,
          vl_desconto: form.vl_desconto ? parseFloat(form.vl_desconto) : null,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ id_prestador: "", dt_periodo_inicio: "", dt_periodo_fim: "", vl_bruto: "", vl_desconto: "", tx_observacoes: "" });
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
        <h1 className="text-lg font-semibold text-gray-800">Repasses ({total})</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary/90">
          Novo
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Prestador ID</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Período Início</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Período Fim</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Bruto</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Desconto</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Total</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Efetivação</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">Carregando...</td></tr>
            ) : repasses.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">Nenhum repasse encontrado</td></tr>
            ) : (
              repasses.map((r) => (
                <tr key={r.id_repasse} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">{r.id_prestador ?? "—"}</td>
                  <td className="px-4 py-2">{fmtDate(r.dt_periodo_inicio)}</td>
                  <td className="px-4 py-2">{fmtDate(r.dt_periodo_fim)}</td>
                  <td className="px-4 py-2 text-right">{fmt(r.vl_bruto)}</td>
                  <td className="px-4 py-2 text-right text-red-500">{fmt(r.vl_desconto)}</td>
                  <td className="px-4 py-2 text-right font-medium">{fmt(r.vl_total)}</td>
                  <td className="px-4 py-2">{fmtDate(r.dt_efetivacao)}</td>
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
              <h2 className="text-sm font-semibold text-gray-800">Novo Repasse</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ID Prestador *</label>
                <input type="number" required value={form.id_prestador} onChange={(e) => setForm({ ...form, id_prestador: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Período Início</label>
                  <input type="date" value={form.dt_periodo_inicio} onChange={(e) => setForm({ ...form, dt_periodo_inicio: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Período Fim</label>
                  <input type="date" value={form.dt_periodo_fim} onChange={(e) => setForm({ ...form, dt_periodo_fim: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Valor Bruto</label>
                  <input type="number" step="0.01" value={form.vl_bruto} onChange={(e) => setForm({ ...form, vl_bruto: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Desconto</label>
                  <input type="number" step="0.01" value={form.vl_desconto} onChange={(e) => setForm({ ...form, vl_desconto: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
                <textarea value={form.tx_observacoes} onChange={(e) => setForm({ ...form, tx_observacoes: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" rows={2} />
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
