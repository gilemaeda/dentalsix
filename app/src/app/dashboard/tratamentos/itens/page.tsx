"use client";

import { useState, useEffect, useCallback } from "react";

interface PtItem {
  id_pt_item: number;
  tx_nome_prc_item: string | null;
  tx_prestador_exe: string | null;
  cd_status: string | null;
  vl_pac: number | null;
  vl_rep: number | null;
  dt_finalizacao: string | null;
  tx_regiao: string | null;
  tx_faces: string | null;
  tx_observacoes: string | null;
  fl_ativo: boolean;
}

export default function TratamentoItensPage() {
  const [itens, setItens] = useState<PtItem[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id_pt_header: "",
    id_tab_prc_item: "",
    id_prestador_exe: "",
    tx_regiao: "",
    tx_faces: "",
    vl_pac: "",
    vl_rep: "",
    tx_observacoes: "",
  });

  const fetchItens = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/tratamentos/itens?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItens(data.itens || []);
        setTotal(data.total || 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => {
    const timer = setTimeout(fetchItens, 300);
    return () => clearTimeout(timer);
  }, [fetchItens]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/tratamentos/itens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id_pt_header: form.id_pt_header ? Number(form.id_pt_header) : null,
          id_tab_prc_item: form.id_tab_prc_item ? Number(form.id_tab_prc_item) : null,
          id_prestador_exe: form.id_prestador_exe ? Number(form.id_prestador_exe) : null,
          vl_pac: form.vl_pac ? Number(form.vl_pac) : null,
          vl_rep: form.vl_rep ? Number(form.vl_rep) : null,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ id_pt_header: "", id_tab_prc_item: "", id_prestador_exe: "", tx_regiao: "", tx_faces: "", vl_pac: "", vl_rep: "", tx_observacoes: "" });
        fetchItens();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  function formatCurrency(val: number | null) {
    if (val == null) return "—";
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Itens de Tratamento</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors"
        >
          Novo Item
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por procedimento ou prestador..."
            className="w-full sm:w-80 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Procedimento</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Prestador</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Pac.</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Região</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Finalização</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td>
                </tr>
              ) : itens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">Nenhum item de tratamento cadastrado</p>
                  </td>
                </tr>
              ) : (
                itens.map((item) => (
                  <tr key={item.id_pt_item} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{item.tx_nome_prc_item || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{item.tx_prestador_exe || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.cd_status === "FINALIZADO" ? "bg-green-100 text-green-700" :
                        item.cd_status === "EM_ANDAMENTO" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {item.cd_status || "Pendente"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{formatCurrency(item.vl_pac)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{item.tx_regiao || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell">
                      {item.dt_finalizacao ? new Date(item.dt_finalizacao).toLocaleDateString("pt-BR") : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-200 text-xs text-gray-500">
            {total} ite{total !== 1 ? "ns" : "m"} encontrado{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Novo Item de Tratamento</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Tratamento *</label>
                  <input type="number" required value={form.id_pt_header} onChange={(e) => setForm({ ...form, id_pt_header: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Procedimento</label>
                  <input type="number" value={form.id_tab_prc_item} onChange={(e) => setForm({ ...form, id_tab_prc_item: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Prestador Executor</label>
                <input type="number" value={form.id_prestador_exe} onChange={(e) => setForm({ ...form, id_prestador_exe: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Região</label>
                  <input type="text" value={form.tx_regiao} onChange={(e) => setForm({ ...form, tx_regiao: e.target.value })} placeholder="Ex: 11, 12, 21" className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Faces</label>
                  <input type="text" value={form.tx_faces} onChange={(e) => setForm({ ...form, tx_faces: e.target.value })} placeholder="Ex: M, O, D" className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Paciente</label>
                  <input type="number" step="0.01" value={form.vl_pac} onChange={(e) => setForm({ ...form, vl_pac: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Repasse</label>
                  <input type="number" step="0.01" value={form.vl_rep} onChange={(e) => setForm({ ...form, vl_rep: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea value={form.tx_observacoes} onChange={(e) => setForm({ ...form, tx_observacoes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
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
