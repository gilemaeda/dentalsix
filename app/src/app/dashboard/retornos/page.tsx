"use client";

import { useState, useEffect, useCallback } from "react";

interface Retorno {
  id_retorno: number;
  vl_mes: number | null;
  vl_ano: number | null;
  id_motivo: string | null;
  tx_observacoes: string | null;
  dt_criacao: string;
  prestador: { tx_nome: string };
  paciente: { tx_nome: string };
}

export default function RetornosPage() {
  const [retornos, setRetornos] = useState<Retorno[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id_prestador: "",
    id_paciente: "",
    vl_mes: "",
    vl_ano: "",
    id_motivo: "",
    tx_observacoes: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/retornos");
      if (res.ok) {
        const data = await res.json();
        setRetornos(data.retornos);
        setTotal(data.total);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/retornos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_prestador: parseInt(form.id_prestador),
          id_paciente: parseInt(form.id_paciente),
          vl_mes: form.vl_mes ? parseInt(form.vl_mes) : null,
          vl_ano: form.vl_ano ? parseInt(form.vl_ano) : null,
          id_motivo: form.id_motivo || null,
          tx_observacoes: form.tx_observacoes || null,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ id_prestador: "", id_paciente: "", vl_mes: "", vl_ano: "", id_motivo: "", tx_observacoes: "" });
        fetchData();
      }
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  const MESES = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Retornos</h1>
        <button onClick={() => setShowModal(true)} className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors">
          Novo Retorno
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Criado</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Paciente</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Prestador</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Período</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td></tr>
              ) : retornos.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  <p className="text-sm">Nenhum retorno cadastrado</p>
                </td></tr>
              ) : retornos.map((r) => (
                <tr key={r.id_retorno} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-4 py-2.5 text-sm text-gray-600">{formatDate(r.dt_criacao)}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{r.paciente.tx_nome}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{r.prestador.tx_nome}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">
                    {r.vl_mes && r.vl_ano ? `${MESES[r.vl_mes]}/${r.vl_ano}` : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell">{r.id_motivo || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-200 text-xs text-gray-500">
            {total} retorno{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Novo Retorno</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID do Paciente *</label>
                  <input type="number" required value={form.id_paciente}
                    onChange={(e) => setForm({ ...form, id_paciente: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID do Prestador *</label>
                  <input type="number" required value={form.id_prestador}
                    onChange={(e) => setForm({ ...form, id_prestador: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                  <select value={form.vl_mes} onChange={(e) => setForm({ ...form, vl_mes: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                    <option value="">—</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{MESES[i + 1]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                  <input type="number" value={form.vl_ano}
                    onChange={(e) => setForm({ ...form, vl_ano: e.target.value })}
                    placeholder="2026" min="2020" max="2030"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                  <input type="text" value={form.id_motivo}
                    onChange={(e) => setForm({ ...form, id_motivo: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea value={form.tx_observacoes}
                  onChange={(e) => setForm({ ...form, tx_observacoes: e.target.value })}
                  rows={3} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors disabled:opacity-50">
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
