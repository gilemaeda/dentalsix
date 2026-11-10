"use client";

import { useState, useEffect, useCallback } from "react";

interface CampoLivre {
  id_campo_livre: number;
  tx_descricao: string;
  cd_tipo: string | null;
  vl_ordem: number | null;
  fl_obrigatorio: boolean;
  fl_ativo: boolean;
}

export default function CamposLivresPage() {
  const [campos, setCampos] = useState<CampoLivre[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tx_descricao: "",
    cd_tipo: "Texto",
    vl_ordem: "",
    fl_obrigatorio: false,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/campos-livres");
      if (res.ok) {
        const data = await res.json();
        setCampos(data.campos);
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
      const res = await fetch("/api/campos-livres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          vl_ordem: form.vl_ordem ? parseInt(form.vl_ordem) : null,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ tx_descricao: "", cd_tipo: "Texto", vl_ordem: "", fl_obrigatorio: false });
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
        <h1 className="text-lg font-semibold text-gray-800">Campos Livres ({total})</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary/90">
          Novo
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Ordem</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Descrição</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Tipo</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Obrigatório</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-400">Carregando...</td></tr>
            ) : campos.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-400">Nenhum campo livre encontrado</td></tr>
            ) : (
              campos.map((c) => (
                <tr key={c.id_campo_livre} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-500">{c.vl_ordem ?? "—"}</td>
                  <td className="px-4 py-2">{c.tx_descricao}</td>
                  <td className="px-4 py-2">{c.cd_tipo || "—"}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${c.fl_obrigatorio ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.fl_obrigatorio ? "Sim" : "Não"}
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
              <h2 className="text-sm font-semibold text-gray-800">Novo Campo Livre</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Descrição *</label>
                <input type="text" required value={form.tx_descricao} onChange={(e) => setForm({ ...form, tx_descricao: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                  <select value={form.cd_tipo} onChange={(e) => setForm({ ...form, cd_tipo: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm">
                    <option value="Texto">Texto</option>
                    <option value="Número">Número</option>
                    <option value="Data">Data</option>
                    <option value="Lista">Lista</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ordem</label>
                  <input type="number" value={form.vl_ordem} onChange={(e) => setForm({ ...form, vl_ordem: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="fl_obrigatorio" checked={form.fl_obrigatorio} onChange={(e) => setForm({ ...form, fl_obrigatorio: e.target.checked })} className="rounded" />
                <label htmlFor="fl_obrigatorio" className="text-xs text-gray-600">Obrigatório</label>
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
