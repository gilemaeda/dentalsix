"use client";

import { useState, useEffect, useCallback } from "react";

interface Prestador {
  id_prestador: number;
  tx_nome: string;
  tx_apelido: string | null;
  tx_cpf: string | null;
  tx_cro: string | null;
  id_cro_uf: string | null;
  cd_tipo: string | null;
  tx_email: string | null;
  tx_celular: string | null;
  fl_habilitado: boolean;
  fl_ativo: boolean;
  especialidade: { tx_descricao: string } | null;
}

export default function PrestadoresPage() {
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tx_nome: "",
    tx_cpf: "",
    tx_cro: "",
    id_cro_uf: "",
    tx_email: "",
    tx_celular: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/prestadores?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPrestadores(data.prestadores);
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
      const res = await fetch("/api/prestadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ tx_nome: "", tx_cpf: "", tx_cro: "", id_cro_uf: "", tx_email: "", tx_celular: "" });
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
        <h1 className="text-lg font-semibold text-gray-800">Corpo Clínico</h1>
        <button onClick={() => setShowModal(true)} className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors">
          Novo Profissional
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome..."
            className="w-full sm:w-80 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Apelido</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">CRO</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tipo</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td></tr>
              ) : prestadores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    <p className="text-sm">Nenhum profissional cadastrado</p>
                    <p className="text-xs mt-1">Clique em &quot;Novo Profissional&quot; para começar</p>
                  </td>
                </tr>
              ) : (
                prestadores.map((p) => (
                  <tr key={p.id_prestador} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{p.tx_nome}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{p.tx_apelido || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{p.tx_cro ? `${p.tx_cro}${p.id_cro_uf ? ` / ${p.id_cro_uf}` : ""}` : "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell">{p.cd_tipo || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.fl_ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
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
            {total} profissional{total !== 1 ? "is" : ""} encontrado{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Novo Profissional</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do profissional *</label>
                <input type="text" required value={form.tx_nome} onChange={(e) => setForm({ ...form, tx_nome: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input type="text" value={form.tx_cpf} onChange={(e) => setForm({ ...form, tx_cpf: e.target.value })} placeholder="000.000.000-00"
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CRO</label>
                  <input type="text" value={form.tx_cro} onChange={(e) => setForm({ ...form, tx_cro: e.target.value })} placeholder="CRO do profissional"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UF CRO</label>
                  <input type="text" value={form.id_cro_uf} onChange={(e) => setForm({ ...form, id_cro_uf: e.target.value })} maxLength={2} placeholder="UF"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.tx_email} onChange={(e) => setForm({ ...form, tx_email: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                  <input type="text" value={form.tx_celular} onChange={(e) => setForm({ ...form, tx_celular: e.target.value })} placeholder="(00) 00000-0000"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
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
