"use client";

import { useState, useEffect, useCallback } from "react";

interface Comissao {
  id_regra_comissao: number;
  tx_prestador: string | null;
  tx_procedimento: string | null;
  cd_modalidade: string | null;
  vl_percentual: number | null;
  vl_valor: number | null;
  tx_descricao: string | null;
  fl_ativo: boolean;
}

export default function ComissoesPage() {
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id_prestador: "",
    id_tab_prc_item: "",
    cd_modalidade: "PERCENTUAL",
    vl_percentual: "",
    vl_valor: "",
    tx_descricao: "",
  });

  const fetchComissoes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/comissoes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setComissoes(data.comissoes || []);
        setTotal(data.total || 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => {
    const timer = setTimeout(fetchComissoes, 300);
    return () => clearTimeout(timer);
  }, [fetchComissoes]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/comissoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id_prestador: form.id_prestador ? Number(form.id_prestador) : null,
          id_tab_prc_item: form.id_tab_prc_item ? Number(form.id_tab_prc_item) : null,
          vl_percentual: form.vl_percentual ? Number(form.vl_percentual) : null,
          vl_valor: form.vl_valor ? Number(form.vl_valor) : null,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ id_prestador: "", id_tab_prc_item: "", cd_modalidade: "PERCENTUAL", vl_percentual: "", vl_valor: "", tx_descricao: "" });
        fetchComissoes();
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
        <h1 className="text-lg font-semibold text-gray-800">Comissões</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors"
        >
          Nova Regra
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por prestador ou procedimento..."
            className="w-full sm:w-80 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Prestador</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Procedimento</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Modalidade</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Percentual</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider text-right hidden lg:table-cell">Valor</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td>
                </tr>
              ) : comissoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Nenhuma regra de comissão cadastrada</p>
                    <p className="text-xs mt-1">Clique em &quot;Nova Regra&quot; para configurar</p>
                  </td>
                </tr>
              ) : (
                comissoes.map((c) => (
                  <tr key={c.id_regra_comissao} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{c.tx_prestador || "Todos"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{c.tx_procedimento || "Todos"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.cd_modalidade === "PERCENTUAL" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      }`}>
                        {c.cd_modalidade || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-right text-gray-600">{c.vl_percentual != null ? `${c.vl_percentual}%` : "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-gray-600 hidden lg:table-cell">{c.vl_valor != null ? c.vl_valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.fl_ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {c.fl_ativo ? "Ativo" : "Inativo"}
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
            {total} regra{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Nova Regra de Comissão</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Prestador</label>
                  <input type="number" value={form.id_prestador} onChange={(e) => setForm({ ...form, id_prestador: e.target.value })} placeholder="Todos" className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Procedimento</label>
                  <input type="number" value={form.id_tab_prc_item} onChange={(e) => setForm({ ...form, id_tab_prc_item: e.target.value })} placeholder="Todos" className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade *</label>
                <select required value={form.cd_modalidade} onChange={(e) => setForm({ ...form, cd_modalidade: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm">
                  <option value="PERCENTUAL">Percentual</option>
                  <option value="VALOR_FIXO">Valor Fixo</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Percentual (%)</label>
                  <input type="number" step="0.01" value={form.vl_percentual} onChange={(e) => setForm({ ...form, vl_percentual: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <input type="number" step="0.01" value={form.vl_valor} onChange={(e) => setForm({ ...form, vl_valor: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={form.tx_descricao} onChange={(e) => setForm({ ...form, tx_descricao: e.target.value })} rows={2} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
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
