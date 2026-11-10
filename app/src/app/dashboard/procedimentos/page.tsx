"use client";

import { useState, useEffect, useCallback } from "react";

interface ProcedimentoItem {
  id_tab_prc_item: number;
  tx_nome: string;
  cd_tab_prc_item: string | null;
  vl_pac: string | null;
  vl_rep: string | null;
  vl_tempo: number | null;
  especialidade?: { tx_descricao: string } | null;
  tabela?: { tx_descricao: string } | null;
}

export default function ProcedimentosPage() {
  const [procedimentos, setProcedimentos] = useState<ProcedimentoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tx_nome: "",
    cd_tab_prc_item: "",
    vl_pac: "",
    vl_rep: "",
    vl_tempo: "",
    id_tipo_cal_prc: "Procedimento",
    id_tab_prc: "1",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/procedimentos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProcedimentos(data.procedimentos);
        setTotal(data.total);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [busca]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/procedimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tx_nome: form.tx_nome,
          cd_tab_prc_item: form.cd_tab_prc_item || null,
          vl_pac: form.vl_pac ? parseFloat(form.vl_pac) : null,
          vl_rep: form.vl_rep ? parseFloat(form.vl_rep) : null,
          vl_tempo: form.vl_tempo ? parseInt(form.vl_tempo) : null,
          id_tipo_cal_prc: form.id_tipo_cal_prc,
          id_tab_prc: parseInt(form.id_tab_prc),
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ tx_nome: "", cd_tab_prc_item: "", vl_pac: "", vl_rep: "", vl_tempo: "", id_tipo_cal_prc: "Procedimento", id_tab_prc: "1" });
        fetchData();
      }
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  function formatMoney(val: string | null) {
    if (!val) return "—";
    return parseFloat(val).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Procedimentos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors"
        >
          Novo item
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="w-full sm:w-80 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Nome do procedimento</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Especialidade</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase text-right">Vl Pac</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase text-right hidden md:table-cell">Vl Rep</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase text-right hidden lg:table-cell">Tempo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td></tr>
              ) : procedimentos.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  <p className="text-sm">Nenhum procedimento cadastrado</p>
                </td></tr>
              ) : procedimentos.map((p) => (
                <tr key={p.id_tab_prc_item} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-4 py-2.5 text-sm text-gray-600">{p.cd_tab_prc_item || "—"}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{p.tx_nome}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{p.especialidade?.tx_descricao || "—"}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-800 text-right">R$ {formatMoney(p.vl_pac)}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 text-right hidden md:table-cell">R$ {formatMoney(p.vl_rep)}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 text-right hidden lg:table-cell">
                    {p.vl_tempo ? `${p.vl_tempo} min` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-200 text-xs text-gray-500">
            {total} procedimento{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Novo Procedimento</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do procedimento *</label>
                <input type="text" required value={form.tx_nome}
                  onChange={(e) => setForm({ ...form, tx_nome: e.target.value })}
                  placeholder="Nome/descrição do procedimento"
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                  <input type="text" value={form.cd_tab_prc_item}
                    onChange={(e) => setForm({ ...form, cd_tab_prc_item: e.target.value })}
                    placeholder="Código do procedimento"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forma de cálculo</label>
                  <select value={form.id_tipo_cal_prc}
                    onChange={(e) => setForm({ ...form, id_tipo_cal_prc: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                    <option value="Procedimento">Procedimento</option>
                    <option value="Por face">Por face</option>
                    <option value="Por arcada">Por arcada</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vl Particular</label>
                  <input type="number" step="0.01" value={form.vl_pac}
                    onChange={(e) => setForm({ ...form, vl_pac: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vl Convênio</label>
                  <input type="number" step="0.01" value={form.vl_rep}
                    onChange={(e) => setForm({ ...form, vl_rep: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempo (min)</label>
                  <input type="number" value={form.vl_tempo}
                    onChange={(e) => setForm({ ...form, vl_tempo: e.target.value })}
                    placeholder="30"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
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
