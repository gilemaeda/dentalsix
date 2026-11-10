"use client";

import { useState, useEffect, useCallback } from "react";

interface Fornecedor {
  id_fornecedor: number;
  tx_nome: string;
  tx_razao_social: string | null;
  tx_cnpj: string | null;
  id_segmento_fornecedor: string | null;
  tx_fone_ddd1: string | null;
  tx_fone_nro1: string | null;
  tx_email1: string | null;
  fl_ativo: boolean;
}

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tx_nome: "",
    tx_razao_social: "",
    tx_cnpj: "",
    id_segmento_fornecedor: "",
    tx_fone_ddd1: "",
    tx_fone_nro1: "",
    tx_email1: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/fornecedores?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFornecedores(data.fornecedores);
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
      const res = await fetch("/api/fornecedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ tx_nome: "", tx_razao_social: "", tx_cnpj: "", id_segmento_fornecedor: "", tx_fone_ddd1: "", tx_fone_nro1: "", tx_email1: "" });
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
        <h1 className="text-lg font-semibold text-gray-800">Fornecedores</h1>
        <button onClick={() => setShowModal(true)} className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors">
          Novo Fornecedor
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou CNPJ..."
            className="w-full sm:w-80 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Segmento</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">CPF/CNPJ</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Telefone</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Email</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td></tr>
              ) : fornecedores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    <p className="text-sm">Nenhum fornecedor cadastrado</p>
                    <p className="text-xs mt-1">Clique em &quot;Novo Fornecedor&quot; para começar</p>
                  </td>
                </tr>
              ) : (
                fornecedores.map((f) => (
                  <tr key={f.id_fornecedor} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{f.tx_nome}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{f.id_segmento_fornecedor || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{f.tx_cnpj || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{f.tx_fone_nro1 ? `${f.tx_fone_ddd1 || ""}${f.tx_fone_nro1}` : "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell">{f.tx_email1 || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-200 text-xs text-gray-500">
            {total} fornecedor{total !== 1 ? "es" : ""} encontrado{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Novo Fornecedor</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do fornecedor *</label>
                <input type="text" required value={form.tx_nome} onChange={(e) => setForm({ ...form, tx_nome: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
                <input type="text" value={form.tx_razao_social} onChange={(e) => setForm({ ...form, tx_razao_social: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label>
                  <input type="text" value={form.tx_cnpj} onChange={(e) => setForm({ ...form, tx_cnpj: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Segmento</label>
                  <input type="text" value={form.id_segmento_fornecedor} onChange={(e) => setForm({ ...form, id_segmento_fornecedor: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DDD</label>
                  <input type="text" value={form.tx_fone_ddd1} onChange={(e) => setForm({ ...form, tx_fone_ddd1: e.target.value })} maxLength={3} placeholder="00"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input type="text" value={form.tx_fone_nro1} onChange={(e) => setForm({ ...form, tx_fone_nro1: e.target.value })} placeholder="00000-0000"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.tx_email1} onChange={(e) => setForm({ ...form, tx_email1: e.target.value })}
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
