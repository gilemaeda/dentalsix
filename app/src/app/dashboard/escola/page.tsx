"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Escola {
  id_escola: number;
  tx_escola: string;
  tx_razao_social: string | null;
  tx_cnpj: string | null;
  tx_escola_apelido: string | null;
  id_uf: string | null;
  id_cidade: string | null;
  fl_habilitado: boolean;
  fl_ativo: boolean;
}

export default function EscolasPage() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tx_escola: "",
    tx_razao_social: "",
    tx_cnpj: "",
    tx_escola_apelido: "",
    tx_cep: "",
    tx_endereco: "",
    tx_numero: "",
    tx_complemento: "",
    id_uf: "",
    id_cidade: "",
  });

  const fetchEscolas = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/escolas?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEscolas(data.escolas);
        setTotal(data.total);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => {
    const timer = setTimeout(fetchEscolas, 300);
    return () => clearTimeout(timer);
  }, [fetchEscolas]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/escolas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ tx_escola: "", tx_razao_social: "", tx_cnpj: "", tx_escola_apelido: "", tx_cep: "", tx_endereco: "", tx_numero: "", tx_complemento: "", id_uf: "", id_cidade: "" });
        fetchEscolas();
      }
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-800">Escolas</h1>
          <div className="flex gap-2 text-sm">
            <Link href="/dashboard/escola/docentes" className="text-primary hover:underline">Docentes</Link>
            <Link href="/dashboard/escola/alunos" className="text-primary hover:underline">Alunos</Link>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors">
          Nova Escola
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar escola..." className="w-full sm:w-80 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da escola</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Cidade</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">UF</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td></tr>
              ) : escolas.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400 text-sm">Nenhuma escola cadastrada</td></tr>
              ) : (
                escolas.map((e) => (
                  <tr key={e.id_escola} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{e.tx_escola}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{e.id_cidade || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{e.id_uf || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${e.fl_habilitado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {e.fl_habilitado ? "Habilitada" : "Desabilitada"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {total > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-200 text-xs text-gray-500">{total} escola{total !== 1 ? "s" : ""}</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Nova Escola</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da escola *</label>
                <input type="text" required value={form.tx_escola} onChange={(e) => setForm({ ...form, tx_escola: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
                  <input type="text" value={form.tx_razao_social} onChange={(e) => setForm({ ...form, tx_razao_social: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                  <input type="text" value={form.tx_cnpj} onChange={(e) => setForm({ ...form, tx_cnpj: e.target.value })} placeholder="00.000.000/0000-00" className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apelido</label>
                <input type="text" value={form.tx_escola_apelido} onChange={(e) => setForm({ ...form, tx_escola_apelido: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                  <input type="text" value={form.tx_cep} onChange={(e) => setForm({ ...form, tx_cep: e.target.value })} placeholder="00000-000" className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <input type="text" value={form.tx_endereco} onChange={(e) => setForm({ ...form, tx_endereco: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                  <input type="text" value={form.tx_numero} onChange={(e) => setForm({ ...form, tx_numero: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
                  <input type="text" value={form.id_uf} onChange={(e) => setForm({ ...form, id_uf: e.target.value })} placeholder="SP" maxLength={2} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <input type="text" value={form.id_cidade} onChange={(e) => setForm({ ...form, id_cidade: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                <input type="text" value={form.tx_complemento} onChange={(e) => setForm({ ...form, tx_complemento: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
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
