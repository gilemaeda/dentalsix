"use client";

import { useState, useEffect, useCallback } from "react";

interface Perfil {
  id_perfil: number;
  tx_nome: string;
  tx_descricao: string | null;
  fl_ativo: boolean;
  dt_criacao: string;
}

export default function PerfisPage() {
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tx_nome: "",
    tx_descricao: "",
  });

  const fetchPerfis = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/perfis?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPerfis(data.perfis || []);
        setTotal(data.total || 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => {
    const timer = setTimeout(fetchPerfis, 300);
    return () => clearTimeout(timer);
  }, [fetchPerfis]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/perfis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ tx_nome: "", tx_descricao: "" });
        fetchPerfis();
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
        <h1 className="text-lg font-semibold text-gray-800">Perfis de Acesso</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors"
        >
          Novo Perfil
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou descrição..."
            className="w-full sm:w-80 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td>
                </tr>
              ) : perfis.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-sm">Nenhum perfil cadastrado</p>
                    <p className="text-xs mt-1">Clique em &quot;Novo Perfil&quot; para criar</p>
                  </td>
                </tr>
              ) : (
                perfis.map((p) => (
                  <tr key={p.id_perfil} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{p.tx_nome}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{p.tx_descricao || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.fl_ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {p.fl_ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-200 text-xs text-gray-500">
            {total} perfi{total !== 1 ? "s" : "l"} encontrado{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Novo Perfil</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input type="text" required value={form.tx_nome} onChange={(e) => setForm({ ...form, tx_nome: e.target.value })} placeholder="Ex: Administrador, Recepcionista, Dentista" className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={form.tx_descricao} onChange={(e) => setForm({ ...form, tx_descricao: e.target.value })} rows={3} placeholder="Descrição das permissões deste perfil..." className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
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
