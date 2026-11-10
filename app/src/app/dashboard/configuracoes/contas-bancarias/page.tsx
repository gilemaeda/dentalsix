"use client";

import { useState, useEffect, useCallback } from "react";

interface ContaBancaria {
  id_cpagar_conta: number;
  tx_nome_conta: string;
  id_banco: string | null;
  tx_agencia: string | null;
  tx_conta: string | null;
  tx_dv_conta: string | null;
  id_tipo_conta_bancaria: string | null;
  tx_nome_titular: string | null;
  tx_cnpj_titular: string | null;
  fl_ativo: boolean;
}

export default function ContasBancariasPage() {
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tx_nome_conta: "",
    id_banco: "",
    tx_agencia: "",
    tx_conta: "",
    tx_dv_conta: "",
    id_tipo_conta_bancaria: "Conta-corrente",
    tx_nome_titular: "",
    tx_cnpj_titular: "",
  });

  const fetchContas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contas-bancarias");
      if (res.ok) {
        const data = await res.json();
        setContas(data.contas);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContas(); }, [fetchContas]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/contas-bancarias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ tx_nome_conta: "", id_banco: "", tx_agencia: "", tx_conta: "", tx_dv_conta: "", id_tipo_conta_bancaria: "Conta-corrente", tx_nome_titular: "", tx_cnpj_titular: "" });
        fetchContas();
      }
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Contas Bancárias</h1>
        <button onClick={() => setShowModal(true)} className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors">
          Nova Conta
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da conta</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Banco</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Agência</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Conta</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tipo</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Titular</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td></tr>
              ) : contas.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">Nenhuma conta bancária cadastrada</td></tr>
              ) : (
                contas.map((c) => (
                  <tr key={c.id_cpagar_conta} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{c.tx_nome_conta}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{c.id_banco || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{c.tx_agencia || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{c.tx_conta ? `${c.tx_conta}${c.tx_dv_conta ? `-${c.tx_dv_conta}` : ""}` : "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell">{c.id_tipo_conta_bancaria || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell">{c.tx_nome_titular || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {contas.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-200 text-xs text-gray-500">
            {contas.length} conta{contas.length !== 1 ? "s" : ""} encontrada{contas.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Nova Conta Bancária</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da conta *</label>
                <input type="text" required value={form.tx_nome_conta} onChange={(e) => setForm({ ...form, tx_nome_conta: e.target.value })} placeholder="Ex: CX GAPO PACIENTE" className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                  <input type="text" value={form.id_banco} onChange={(e) => setForm({ ...form, id_banco: e.target.value })} placeholder="Nome do banco" className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo da conta</label>
                  <select value={form.id_tipo_conta_bancaria} onChange={(e) => setForm({ ...form, id_tipo_conta_bancaria: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm">
                    <option value="Conta-corrente">Conta-corrente</option>
                    <option value="Poupança">Poupança</option>
                    <option value="Caixa">Caixa</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agência</label>
                  <input type="text" value={form.tx_agencia} onChange={(e) => setForm({ ...form, tx_agencia: e.target.value })} placeholder="Nº agência" className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
                  <input type="text" value={form.tx_conta} onChange={(e) => setForm({ ...form, tx_conta: e.target.value })} placeholder="Nº conta" className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DV</label>
                  <input type="text" value={form.tx_dv_conta} onChange={(e) => setForm({ ...form, tx_dv_conta: e.target.value })} placeholder="DV" maxLength={5} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titular</label>
                  <input type="text" value={form.tx_nome_titular} onChange={(e) => setForm({ ...form, tx_nome_titular: e.target.value })} placeholder="Nome do titular" className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ titular</label>
                  <input type="text" value={form.tx_cnpj_titular} onChange={(e) => setForm({ ...form, tx_cnpj_titular: e.target.value })} placeholder="CPF ou CNPJ" className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
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
