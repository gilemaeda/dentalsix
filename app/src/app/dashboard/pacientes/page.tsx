"use client";

import { useState, useEffect, useCallback } from "react";

interface Paciente {
  id_paciente: number;
  tx_nome: string;
  tx_cpf: string | null;
  id_sexo: string | null;
  dt_nascimento: string | null;
  tx_fone_ddd1: string | null;
  tx_fone_nro1: string | null;
  tx_email1: string | null;
  fl_ativo: boolean;
  dt_criacao: string;
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tx_nome: "",
    tx_cpf: "",
    tx_fone_ddd1: "",
    tx_fone_nro1: "",
    tx_email1: "",
    id_sexo: "",
    dt_nascimento: "",
  });

  const fetchPacientes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/pacientes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPacientes(data.pacientes);
        setTotal(data.total);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => {
    const timer = setTimeout(fetchPacientes, 300);
    return () => clearTimeout(timer);
  }, [fetchPacientes]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ tx_nome: "", tx_cpf: "", tx_fone_ddd1: "", tx_fone_nro1: "", tx_email1: "", id_sexo: "", dt_nascimento: "" });
        fetchPacientes();
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
        <h1 className="text-lg font-semibold text-gray-800">Pacientes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors"
        >
          Novo Paciente
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF ou email..."
            className="w-full sm:w-80 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Celular</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Email</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                    Carregando...
                  </td>
                </tr>
              ) : pacientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm">Nenhum paciente cadastrado</p>
                    <p className="text-xs mt-1">Clique em &quot;Novo Paciente&quot; para começar</p>
                  </td>
                </tr>
              ) : (
                pacientes.map((p) => (
                  <tr key={p.id_paciente} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{p.tx_nome}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{p.tx_cpf || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{p.tx_fone_nro1 ? `${p.tx_fone_ddd1 || ""}${p.tx_fone_nro1}` : "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell">{p.tx_email1 || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.fl_ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
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
            {total} paciente{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Modal Novo Paciente */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Novo Paciente</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={form.tx_nome}
                  onChange={(e) => setForm({ ...form, tx_nome: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input
                    type="text"
                    value={form.tx_cpf}
                    onChange={(e) => setForm({ ...form, tx_cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                  <select
                    value={form.id_sexo}
                    onChange={(e) => setForm({ ...form, id_sexo: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={form.dt_nascimento}
                  onChange={(e) => setForm({ ...form, dt_nascimento: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DDD</label>
                  <input
                    type="text"
                    value={form.tx_fone_ddd1}
                    onChange={(e) => setForm({ ...form, tx_fone_ddd1: e.target.value })}
                    placeholder="00"
                    maxLength={3}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                  <input
                    type="text"
                    value={form.tx_fone_nro1}
                    onChange={(e) => setForm({ ...form, tx_fone_nro1: e.target.value })}
                    placeholder="00000-0000"
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.tx_email1}
                  onChange={(e) => setForm({ ...form, tx_email1: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                >
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
