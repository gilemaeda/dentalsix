"use client";

import { useState, useEffect, useCallback } from "react";

interface Convenio {
  id_convenio: number;
  tx_descricao: string;
  fl_ativo: boolean;
}

export default function ConveniosPage() {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState("");

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/convenios");
      if (r.ok) { const d = await r.json(); setConvenios(d.convenios); }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/convenios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tx_descricao: nome }) });
      if (r.ok) { setShowModal(false); setNome(""); fetch_(); }
    } catch {} finally { setSaving(false); }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Convênios</h1>
        <button onClick={() => setShowModal(true)} className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors">Novo Convênio</button>
      </div>
      <div className="bg-white rounded border border-gray-200">
        <table className="w-full">
          <thead><tr className="border-b border-gray-200 bg-gray-50 text-left">
            <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Descrição</th>
            <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase w-24">Status</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td></tr>
            ) : convenios.length === 0 ? (
              <tr><td colSpan={2} className="px-4 py-12 text-center text-gray-400 text-sm">Nenhum convênio cadastrado</td></tr>
            ) : convenios.map((c) => (
              <tr key={c.id_convenio} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-2.5 text-sm text-gray-800">{c.tx_descricao}</td>
                <td className="px-4 py-2.5"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.fl_ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{c.fl_ativo ? "Ativo" : "Inativo"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Novo Convênio</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label><input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
