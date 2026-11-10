"use client";

import { useState, useEffect, useCallback } from "react";

interface ServicoProtese {
  id_servico_protese: number;
  tx_descricao: string | null;
  id_fornecedor: number | null;
  id_prestador: number | null;
  dt_envio: string | null;
  dt_previsao: string | null;
  dt_retorno: string | null;
  vl_custo: string | null;
  vl_valor: string | null;
  cd_status: string | null;
  tx_observacoes: string | null;
}

export default function ServicosProtesePage() {
  const [servicos, setServicos] = useState<ServicoProtese[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tx_descricao: "",
    id_fornecedor: "",
    dt_envio: "",
    dt_previsao: "",
    vl_custo: "",
    vl_valor: "",
    cd_status: "Solicitado",
    tx_observacoes: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("cd_status", statusFilter);
      const res = await fetch(`/api/servicos-protese?${params}`);
      if (res.ok) {
        const data = await res.json();
        setServicos(data.servicos);
        setTotal(data.total);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/servicos-protese", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id_fornecedor: form.id_fornecedor ? parseInt(form.id_fornecedor) : null,
          vl_custo: form.vl_custo ? parseFloat(form.vl_custo) : null,
          vl_valor: form.vl_valor ? parseFloat(form.vl_valor) : null,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ tx_descricao: "", id_fornecedor: "", dt_envio: "", dt_previsao: "", vl_custo: "", vl_valor: "", cd_status: "Solicitado", tx_observacoes: "" });
        fetchData();
      }
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  const fmt = (v: string | null) =>
    v ? parseFloat(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";
  const fmtDate = (v: string | null) =>
    v ? new Date(v).toLocaleDateString("pt-BR") : "—";

  const statusColor: Record<string, string> = {
    Solicitado: "bg-yellow-100 text-yellow-700",
    "Em produção": "bg-blue-100 text-blue-700",
    Pronto: "bg-green-100 text-green-700",
    Entregue: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Serviços de Prótese ({total})</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary/90">
          Novo
        </button>
      </div>

      <div className="mb-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm">
          <option value="">Todos os status</option>
          <option value="Solicitado">Solicitado</option>
          <option value="Em produção">Em produção</option>
          <option value="Pronto">Pronto</option>
          <option value="Entregue">Entregue</option>
        </select>
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Descrição</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Fornecedor ID</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Envio</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Previsão</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Retorno</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Custo</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Valor</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-8 text-center text-gray-400">Carregando...</td></tr>
            ) : servicos.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-gray-400">Nenhum serviço de prótese encontrado</td></tr>
            ) : (
              servicos.map((s) => (
                <tr key={s.id_servico_protese} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">{s.tx_descricao || "—"}</td>
                  <td className="px-4 py-2">{s.id_fornecedor ?? "—"}</td>
                  <td className="px-4 py-2">{fmtDate(s.dt_envio)}</td>
                  <td className="px-4 py-2">{fmtDate(s.dt_previsao)}</td>
                  <td className="px-4 py-2">{fmtDate(s.dt_retorno)}</td>
                  <td className="px-4 py-2 text-right">{fmt(s.vl_custo)}</td>
                  <td className="px-4 py-2 text-right">{fmt(s.vl_valor)}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[s.cd_status || ""] || "bg-gray-100 text-gray-500"}`}>
                      {s.cd_status || "—"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800">Novo Serviço de Prótese</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Descrição *</label>
                <input type="text" required value={form.tx_descricao} onChange={(e) => setForm({ ...form, tx_descricao: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ID Fornecedor</label>
                  <input type="number" value={form.id_fornecedor} onChange={(e) => setForm({ ...form, id_fornecedor: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.cd_status} onChange={(e) => setForm({ ...form, cd_status: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm">
                    <option value="Solicitado">Solicitado</option>
                    <option value="Em produção">Em produção</option>
                    <option value="Pronto">Pronto</option>
                    <option value="Entregue">Entregue</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Data Envio</label>
                  <input type="date" value={form.dt_envio} onChange={(e) => setForm({ ...form, dt_envio: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Data Previsão</label>
                  <input type="date" value={form.dt_previsao} onChange={(e) => setForm({ ...form, dt_previsao: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Custo</label>
                  <input type="number" step="0.01" value={form.vl_custo} onChange={(e) => setForm({ ...form, vl_custo: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Valor</label>
                  <input type="number" step="0.01" value={form.vl_valor} onChange={(e) => setForm({ ...form, vl_valor: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
                <textarea value={form.tx_observacoes} onChange={(e) => setForm({ ...form, tx_observacoes: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" rows={2} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
