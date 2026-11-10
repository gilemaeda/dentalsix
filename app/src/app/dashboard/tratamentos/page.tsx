"use client";

import { useState, useEffect, useCallback } from "react";

interface Tratamento {
  id_pt_header: number;
  dt_inicio: string;
  cd_situacao: string;
  id_beneficio: string | null;
  id_tipo_faturamento_tratamento: string | null;
  tx_observacoes: string | null;
  paciente: { tx_nome: string };
  prestador: { tx_nome: string };
  unidade?: { tx_descricao: string } | null;
}

const SITUACAO_LABELS: Record<string, string> = {
  ATIVO: "Ativo",
  FINALIZADO: "Finalizado",
  INTERROMPIDO: "Interrompido",
};

const SITUACAO_COLORS: Record<string, string> = {
  ATIVO: "bg-green-100 text-green-700",
  FINALIZADO: "bg-blue-100 text-blue-700",
  INTERROMPIDO: "bg-red-100 text-red-700",
};

export default function TratamentosPage() {
  const [tratamentos, setTratamentos] = useState<Tratamento[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [situacaoFilter, setSituacaoFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id_paciente: "",
    id_prestador_crd: "",
    id_beneficio: "",
    id_tipo_faturamento_tratamento: "Por orçamento aprovado",
    tx_observacoes: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      if (situacaoFilter) params.set("situacao", situacaoFilter);
      const res = await fetch(`/api/tratamentos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTratamentos(data.tratamentos);
        setTotal(data.total);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [busca, situacaoFilter]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/tratamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id_paciente: parseInt(form.id_paciente),
          id_prestador_crd: parseInt(form.id_prestador_crd),
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ id_paciente: "", id_prestador_crd: "", id_beneficio: "", id_tipo_faturamento_tratamento: "Por orçamento aprovado", tx_observacoes: "" });
        fetchData();
      }
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Gerenciar Tratamentos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors"
        >
          Novo tratamento
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200 p-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar paciente..."
            className="w-full sm:w-80 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <select value={situacaoFilter} onChange={(e) => setSituacaoFilter(e.target.value)}
            className="px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm">
            <option value="">Todas as situações</option>
            <option value="ATIVO">Ativo</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="INTERROMPIDO">Interrompido</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Abertura</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Paciente</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Prestador</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Unidade</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Benefício</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Situação</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td></tr>
              ) : tratamentos.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  <p className="text-sm">Nenhum tratamento encontrado</p>
                </td></tr>
              ) : tratamentos.map((t) => (
                <tr key={t.id_pt_header} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-4 py-2.5 text-sm text-gray-600">{formatDate(t.dt_inicio)}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{t.paciente.tx_nome}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{t.prestador.tx_nome}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{t.unidade?.tx_descricao || "—"}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell">{t.id_beneficio || "Particular"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SITUACAO_COLORS[t.cd_situacao] || "bg-gray-100 text-gray-700"}`}>
                      {SITUACAO_LABELS[t.cd_situacao] || t.cd_situacao}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-200 text-xs text-gray-500">
            {total} tratamento{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Novo Tratamento</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID do Paciente *</label>
                <input type="number" required value={form.id_paciente}
                  onChange={(e) => setForm({ ...form, id_paciente: e.target.value })}
                  placeholder="ID do paciente"
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID do Prestador *</label>
                <input type="number" required value={form.id_prestador_crd}
                  onChange={(e) => setForm({ ...form, id_prestador_crd: e.target.value })}
                  placeholder="ID do prestador responsável"
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Benefício</label>
                <input type="text" value={form.id_beneficio}
                  onChange={(e) => setForm({ ...form, id_beneficio: e.target.value })}
                  placeholder="Benefício ou plano odontológico"
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de faturamento</label>
                <select value={form.id_tipo_faturamento_tratamento}
                  onChange={(e) => setForm({ ...form, id_tipo_faturamento_tratamento: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                  <option value="Por orçamento aprovado">Por orçamento aprovado</option>
                  <option value="Faturamento por guia">Faturamento por guia</option>
                  <option value="Fatura única">Fatura única</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea value={form.tx_observacoes}
                  onChange={(e) => setForm({ ...form, tx_observacoes: e.target.value })}
                  rows={3} placeholder="Observações sobre o tratamento"
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors disabled:opacity-50">
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
