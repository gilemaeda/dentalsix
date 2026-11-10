"use client";

import { useState, useEffect, useCallback } from "react";

interface Documento {
  id_documento: number;
  tx_titulo: string | null;
  tx_paciente: string | null;
  id_tipo_arquivo: string | null;
  tx_descricao: string | null;
  dt_criacao: string;
  fl_ativo: boolean;
}

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tx_titulo: "",
    id_paciente: "",
    id_tipo_arquivo: "",
    tx_descricao: "",
  });

  const fetchDocumentos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/documentos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setDocumentos(data.documentos || []);
        setTotal(data.total || 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => {
    const timer = setTimeout(fetchDocumentos, 300);
    return () => clearTimeout(timer);
  }, [fetchDocumentos]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/documentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id_paciente: form.id_paciente ? Number(form.id_paciente) : null,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ tx_titulo: "", id_paciente: "", id_tipo_arquivo: "", tx_descricao: "" });
        fetchDocumentos();
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
        <h1 className="text-lg font-semibold text-gray-800">Documentos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors"
        >
          Novo Documento
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, paciente ou tipo..."
            className="w-full sm:w-80 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Tipo</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Data</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td>
                </tr>
              ) : documentos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Nenhum documento cadastrado</p>
                    <p className="text-xs mt-1">Clique em &quot;Novo Documento&quot; para adicionar</p>
                  </td>
                </tr>
              ) : (
                documentos.map((d) => (
                  <tr key={d.id_documento} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{d.tx_titulo || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{d.tx_paciente || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{d.id_tipo_arquivo || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell">{new Date(d.dt_criacao).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        d.fl_ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {d.fl_ativo ? "Ativo" : "Inativo"}
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
            {total} documento{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Novo Documento</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input type="text" required value={form.tx_titulo} onChange={(e) => setForm({ ...form, tx_titulo: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Paciente</label>
                  <input type="number" value={form.id_paciente} onChange={(e) => setForm({ ...form, id_paciente: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select value={form.id_tipo_arquivo} onChange={(e) => setForm({ ...form, id_tipo_arquivo: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm">
                    <option value="">Selecione</option>
                    <option value="ATESTADO">Atestado</option>
                    <option value="RECEITA">Receita</option>
                    <option value="ENCAMINHAMENTO">Encaminhamento</option>
                    <option value="LAUDO">Laudo</option>
                    <option value="CONTRATO">Contrato</option>
                    <option value="ORCAMENTO">Orçamento</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={form.tx_descricao} onChange={(e) => setForm({ ...form, tx_descricao: e.target.value })} rows={3} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
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
