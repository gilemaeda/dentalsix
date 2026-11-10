"use client";

import { useState, useEffect, useCallback } from "react";

interface Medicamento {
  id_medicamento: number;
  tx_nome_medicamento: string;
  id_classe_terapeutica: string | null;
  id_tipo_uso_medicamento: string | null;
  id_via_uso_medicamento: string | null;
  tx_posologia: string | null;
  tx_quantidade: string | null;
  fl_ativo: boolean;
}

export default function MedicamentosPage() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tx_nome_medicamento: "",
    id_classe_terapeutica: "",
    id_tipo_uso_medicamento: "",
    id_via_uso_medicamento: "",
    tx_posologia: "",
    tx_quantidade: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/medicamentos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMedicamentos(data.medicamentos);
        setTotal(data.total);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/medicamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ tx_nome_medicamento: "", id_classe_terapeutica: "", id_tipo_uso_medicamento: "", id_via_uso_medicamento: "", tx_posologia: "", tx_quantidade: "" });
        fetchData();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Medicamentos</h1>
        <button onClick={() => setShowModal(true)} className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors">
          Novo Medicamento
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar medicamento..."
            className="w-full sm:w-80 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Posologia</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Classe terapêutica</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td></tr>
              ) : medicamentos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-gray-400">
                    <p className="text-sm">Nenhum medicamento cadastrado</p>
                    <p className="text-xs mt-1">Clique em &quot;Novo Medicamento&quot; para começar</p>
                  </td>
                </tr>
              ) : (
                medicamentos.map((m) => (
                  <tr key={m.id_medicamento} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{m.tx_nome_medicamento}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{m.tx_posologia || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{m.id_classe_terapeutica || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-200 text-xs text-gray-500">
            {total} medicamento{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Novo Medicamento</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do medicamento *</label>
                <input type="text" required value={form.tx_nome_medicamento} onChange={(e) => setForm({ ...form, tx_nome_medicamento: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Classe terapêutica</label>
                  <input type="text" value={form.id_classe_terapeutica} onChange={(e) => setForm({ ...form, id_classe_terapeutica: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de uso</label>
                  <input type="text" value={form.id_tipo_uso_medicamento} onChange={(e) => setForm({ ...form, id_tipo_uso_medicamento: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Via de uso</label>
                  <input type="text" value={form.id_via_uso_medicamento} onChange={(e) => setForm({ ...form, id_via_uso_medicamento: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade padrão</label>
                  <input type="text" value={form.tx_quantidade} onChange={(e) => setForm({ ...form, tx_quantidade: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posologia</label>
                <textarea value={form.tx_posologia} onChange={(e) => setForm({ ...form, tx_posologia: e.target.value })} rows={3}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
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
