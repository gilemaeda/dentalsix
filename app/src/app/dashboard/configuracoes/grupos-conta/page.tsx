"use client";

import { useState, useEffect, useCallback } from "react";

interface GrupoConta {
  id_grupo_conta: number;
  tx_descricao: string;
  fl_ativo: boolean;
}

export default function GruposContaPage() {
  const [grupos, setGrupos] = useState<GrupoConta[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tx_descricao: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/grupos-conta?${params}`);
      if (res.ok) {
        const data = await res.json();
        setGrupos(data.grupos);
        setTotal(data.total);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/grupos-conta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ tx_descricao: "" });
        fetchData();
      }
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Grupos de Conta ({total})</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary/90">
          Novo
        </button>
      </div>

      <div className="mb-3">
        <input type="text" placeholder="Buscar grupo..." value={busca} onChange={(e) => setBusca(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64" />
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Descrição</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={2} className="p-8 text-center text-gray-400">Carregando...</td></tr>
            ) : grupos.length === 0 ? (
              <tr><td colSpan={2} className="p-8 text-center text-gray-400">Nenhum grupo encontrado</td></tr>
            ) : (
              grupos.map((g) => (
                <tr key={g.id_grupo_conta} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">{g.tx_descricao}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${g.fl_ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {g.fl_ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800">Novo Grupo de Conta</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Descrição *</label>
                <input type="text" required value={form.tx_descricao} onChange={(e) => setForm({ tx_descricao: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
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
