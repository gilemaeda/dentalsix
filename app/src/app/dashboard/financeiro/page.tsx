"use client";

import Link from "next/link";

const modules = [
  { nome: "Contas a Receber", href: "/dashboard/financeiro/receber", desc: "Gerenciar recebimentos de pacientes e convênios", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1", color: "bg-green-50 text-green-600" },
  { nome: "Contas a Pagar", href: "/dashboard/financeiro/pagar", desc: "Gerenciar despesas e pagamentos a fornecedores", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z", color: "bg-red-50 text-red-600" },
  { nome: "Fluxo de Caixa", href: "/dashboard/financeiro/fluxo-caixa", desc: "Visualizar entradas e saídas financeiras", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "bg-blue-50 text-blue-600" },
  { nome: "Comissões", href: "/dashboard/financeiro/comissoes", desc: "Controle de comissões por prestador", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "bg-purple-50 text-purple-600" },
  { nome: "Recibos", href: "/dashboard/financeiro/recibos", desc: "Emitir e gerenciar recibos", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "bg-amber-50 text-amber-600" },
  { nome: "NFS-e", href: "/dashboard/financeiro/nfse", desc: "Notas fiscais de serviço eletrônicas", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z", color: "bg-teal-50 text-teal-600" },
];

export default function FinanceiroPage() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">Financeiro</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => (
          <Link key={m.nome} href={m.href} className="bg-white rounded border border-gray-200 p-5 hover:border-primary hover:shadow-sm transition-all">
            <div className={`w-10 h-10 rounded flex items-center justify-center mb-3 ${m.color}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={m.icon} /></svg>
            </div>
            <h3 className="text-sm font-medium text-gray-800">{m.nome}</h3>
            <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
