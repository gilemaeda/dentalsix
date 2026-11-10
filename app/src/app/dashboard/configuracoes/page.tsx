"use client";

import Link from "next/link";

const sections = [
  { titulo: "Cadastros", items: [
    { nome: "Especialidades", href: "/dashboard/configuracoes/especialidades", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
    { nome: "Convênios", href: "/dashboard/convenios", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { nome: "Procedimentos", href: "/dashboard/procedimentos", icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" },
    { nome: "Plano de Contas", href: "/dashboard/configuracoes/plano-contas", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
    { nome: "Grupos de Conta", href: "/dashboard/configuracoes/grupos-conta", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { nome: "Campos Livres", href: "/dashboard/configuracoes/campos-livres", icon: "M4 6h16M4 12h8m-8 6h16" },
    { nome: "Repasses", href: "/dashboard/configuracoes/repasses", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
  ]},
  { titulo: "Segurança", items: [
    { nome: "Usuários", href: "/dashboard/configuracoes/usuarios", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { nome: "Perfis de Acesso", href: "/dashboard/configuracoes/perfis", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { nome: "Trilha de Auditoria", href: "/dashboard/configuracoes/auditoria", icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
  ]},
  { titulo: "Sistema", items: [
    { nome: "Dados da Empresa", href: "/dashboard/configuracoes/empresa", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { nome: "Contas Bancárias", href: "/dashboard/configuracoes/contas-bancarias", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { nome: "Unidades", href: "/dashboard/configuracoes/unidades", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
  ]},
];

export default function ConfiguracoesPage() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">Configurações</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <div key={s.titulo} className="bg-white rounded border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">{s.titulo}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {s.items.map((item) => (
                <Link key={item.nome} href={item.href} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors">
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                  {item.nome}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
