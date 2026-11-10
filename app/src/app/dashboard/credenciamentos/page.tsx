"use client";

import { useState, useEffect, useCallback } from "react";

interface Credenciamento {
  id_credenciamento: number;
  tx_codigo: string | null;
  vl_us: string | null;
  tx_alerta: string | null;
  tx_observacoes: string | null;
  dt_criacao: string;
  prestador: { tx_nome: string };
  convenio?: { tx_descricao: string } | null;
}

export default function CredenciamentosPage() {
  const [credenciamentos, setCredenciamentos] = useState<Credenciamento[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id_prestador: "",
    id_operadora: "",
    tx_codigo: "",
    vl_us: "",
    tx_alerta: "",
    tx_observacoes: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/credenciamentos");
      if (res.ok) {
        const data = await res.json();
        setCredenciamentos(data.credenciamentos);
        setTotal(data.total);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/credenciamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_prestador: parseInt(form.id_prestador),
          id_operadora: form.id_operadora ? parseInt(form.id_operadora) : null,
          tx_codigo: form.tx_codigo || null,
          vl_us: form.vl_us ? parseFloat(form.vl_us) : null,
          tx_alerta: form.tx_alerta || null,
          tx_observacoes: form.tx_observacoes || null,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ id_prestador: "", id_operadora: "", tx_codigo: "", vl_us: "", tx_alerta: "", tx_observacoes: "" });
        fetchData();
      }
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Credenciamentos</h1>
        <button onClick={() => setShowModal(true)} className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors">
          Novo Credenciamento
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Criado</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Prestador</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Convênio</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Código</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell text-right">Vl US</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Alerta</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td></tr>
              ) : credenciamentos.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  <p className="text-sm">Nenhum credenciamento cadastrado</p>
                </td></tr>
              ) : credenciamentos.map((c) => (
                <tr key={c.id_credenciamento} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-4 py-2.5 text-sm text-gray-600">{formatDate(c.dt_criacao)}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{c.prestador.tx_nome}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{c.convenio?.tx_descricao || "—"}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{c.tx_codigo || "—"}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell text-right">{c.vl_us ? parseFloat(c.vl_us).toFixed(2) : "—"}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell">{c.tx_alerta || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-200 text-xs text-gray-500">
            {total} credenciamento{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Novo Credenciamento</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID do Prestador *</label>
                  <input type="number" required value={form.id_prestador}
                    onChange={(e) => setForm({ ...form, id_prestador: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Operadora/Convênio</label>
                  <input type="number" value={form.id_operadora}
                    onChange={(e) => setForm({ ...form, id_operadora: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código credenciamento</label>
                  <input type="text" value={form.tx_codigo}
                    onChange={(e) => setForm({ ...form, tx_codigo: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor US (R$)</label>
                  <input type="number" step="0.01" value={form.vl_us}
                    onChange={(e) => setForm({ ...form, vl_us: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alerta</label>
                <input type="text" value={form.tx_alerta}
                  onChange={(e) => setForm({ ...form, tx_alerta: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
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
