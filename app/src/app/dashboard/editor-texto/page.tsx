"use client";

import { useState, useEffect, useCallback } from "react";

interface EditorTexto {
  id_editor_texto: number;
  tx_titulo: string | null;
  tx_descricao: string | null;
  cd_tipo: string | null;
  tx_conteudo: string | null;
  fl_ativo: boolean;
  dt_criacao: string;
}

export default function EditorTextoPage() {
  const [templates, setTemplates] = useState<EditorTexto[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tx_titulo: "",
    tx_descricao: "",
    cd_tipo: "",
    tx_conteudo: "",
  });

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/editor-texto?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
        setTotal(data.total || 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => {
    const timer = setTimeout(fetchTemplates, 300);
    return () => clearTimeout(timer);
  }, [fetchTemplates]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/editor-texto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ tx_titulo: "", tx_descricao: "", cd_tipo: "", tx_conteudo: "" });
        fetchTemplates();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  const tipoLabel: Record<string, string> = {
    SMS: "SMS",
    EMAIL: "E-mail",
    WHATSAPP: "WhatsApp",
    ATESTADO: "Atestado",
    RECEITA: "Receita",
    ORCAMENTO: "Orçamento",
    CONTRATO: "Contrato",
    ENCAMINHAMENTO: "Encaminhamento",
    OUTRO: "Outro",
  };

  const tipoBadge: Record<string, string> = {
    SMS: "bg-green-100 text-green-700",
    EMAIL: "bg-blue-100 text-blue-700",
    WHATSAPP: "bg-emerald-100 text-emerald-700",
    ATESTADO: "bg-purple-100 text-purple-700",
    RECEITA: "bg-orange-100 text-orange-700",
    ORCAMENTO: "bg-yellow-100 text-yellow-700",
    CONTRATO: "bg-indigo-100 text-indigo-700",
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Modelos de Texto</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors"
        >
          Novo Modelo
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título ou tipo..."
            className="w-full sm:w-80 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Descrição</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <p className="text-sm">Nenhum modelo de texto cadastrado</p>
                    <p className="text-xs mt-1">Clique em &quot;Novo Modelo&quot; para criar</p>
                  </td>
                </tr>
              ) : (
                templates.map((t) => (
                  <tr key={t.id_editor_texto} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{t.tx_titulo || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        tipoBadge[t.cd_tipo || ""] || "bg-gray-100 text-gray-700"
                      }`}>
                        {tipoLabel[t.cd_tipo || ""] || t.cd_tipo || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell truncate max-w-[250px]">{t.tx_descricao || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.fl_ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {t.fl_ativo ? "Ativo" : "Inativo"}
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
            {total} modelo{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Novo Modelo de Texto</h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select required value={form.cd_tipo} onChange={(e) => setForm({ ...form, cd_tipo: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm">
                    <option value="">Selecione</option>
                    <option value="SMS">SMS</option>
                    <option value="EMAIL">E-mail</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="ATESTADO">Atestado</option>
                    <option value="RECEITA">Receita</option>
                    <option value="ORCAMENTO">Orçamento</option>
                    <option value="CONTRATO">Contrato</option>
                    <option value="ENCAMINHAMENTO">Encaminhamento</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input type="text" value={form.tx_descricao} onChange={(e) => setForm({ ...form, tx_descricao: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo *</label>
                <textarea required value={form.tx_conteudo} onChange={(e) => setForm({ ...form, tx_conteudo: e.target.value })} rows={6} placeholder="Use variáveis como {nome_paciente}, {data_consulta}, {nome_profissional}..." className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-mono" />
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
