"use client";

const relatorios = [
  { grupo: "Pacientes", items: ["Listagem de pacientes", "Aniversariantes", "Pacientes por convênio", "Pacientes inativos"] },
  { grupo: "Financeiro", items: ["Contas a receber", "Contas a pagar", "Fluxo de caixa", "Comissões", "Faturamento por convênio"] },
  { grupo: "Agenda", items: ["Agendamentos por período", "Faltas e cancelamentos", "Ocupação da agenda", "Produtividade por prestador"] },
  { grupo: "Tratamentos", items: ["Tratamentos realizados", "Tratamentos pendentes", "Orçamentos aprovados", "Procedimentos por prestador"] },
];

export default function RelatoriosPage() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">Relatórios</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatorios.map((r) => (
          <div key={r.grupo} className="bg-white rounded border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">{r.grupo}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {r.items.map((item) => (
                <button key={item} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors flex items-center justify-between">
                  {item}
                  <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
