"use client";

import { useState, useEffect, useCallback } from "react";

interface Aluno {
  id_aluno: number;
  tx_aluno: string;
  tx_cpf: string | null;
  tx_matricula: string | null;
  tx_email: string | null;
  tx_login: string | null;
  escola: { tx_escola: string };
}

interface Escola {
  id_escola: number;
  tx_escola: string;
}

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tx_aluno: "",
    tx_cpf: "",
    tx_aluno_apelido: "",
    tx_matricula: "",
    tx_email: "",
    tx_login: "",
    id_escola: 0,
  });

  const fetchAlunos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/alunos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAlunos(data.alunos);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => {
    const timer = setTimeout(fetchAlunos, 300);
    return () => clearTimeout(timer);
  }, [fetchAlunos]);

  useEffect(() => {
    fetch("/api/escolas").then(r => r.json()).then(d => setEscolas(d.escolas || [])).catch(() => {});
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ tx_aluno: "", tx_cpf: "", tx_aluno_apelido: "", tx_matricula: "", tx_email: "", tx_login: "", id_escola: 0 });
        fetchAlunos();
      }
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Alunos</h1>
        <button onClick={() => setShowModal(true)} className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors">
          Novo Aluno
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar aluno..." className="w-full sm:w-80 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Escola</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Matrícula</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Login</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Email</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td></tr>
              ) : alunos.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">Nenhum aluno cadastrado</td></tr>
              ) : (
                alunos.map((a) => (
                  <tr key={a.id_aluno} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{a.tx_aluno}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{a.escola.tx_escola}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{a.tx_matricula || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{a.tx_login || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell">{a.tx_email || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Novo Aluno</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do aluno *</label>
                <input type="text" required value={form.tx_aluno} onChange={(e) => setForm({ ...form, tx_aluno: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Escola *</label>
                <select required value={form.id_escola} onChange={(e) => setForm({ ...form, id_escola: Number(e.target.value) })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm">
                  <option value={0}>Selecione a escola</option>
                  {escolas.map(esc => <option key={esc.id_escola} value={esc.id_escola}>{esc.tx_escola}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input type="text" value={form.tx_cpf} onChange={(e) => setForm({ ...form, tx_cpf: e.target.value })} placeholder="000.000.000-00" className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
                  <input type="text" value={form.tx_matricula} onChange={(e) => setForm({ ...form, tx_matricula: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.tx_email} onChange={(e) => setForm({ ...form, tx_email: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Login</label>
                  <input type="text" value={form.tx_login} onChange={(e) => setForm({ ...form, tx_login: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apelido</label>
                <input type="text" value={form.tx_aluno_apelido} onChange={(e) => setForm({ ...form, tx_aluno_apelido: e.target.value })} className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving || !form.id_escola} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
