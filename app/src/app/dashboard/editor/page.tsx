"use client";

const modelos = [
  { nome: "Receituário", descricao: "Modelo de receita médica/odontológica" },
  { nome: "Atestado", descricao: "Modelo de atestado odontológico" },
  { nome: "Declaração", descricao: "Declaração de comparecimento" },
  { nome: "Orçamento", descricao: "Modelo de orçamento para tratamento" },
  { nome: "Contrato", descricao: "Contrato de prestação de serviços" },
  { nome: "Termo de Consentimento", descricao: "Termo de consentimento informado" },
  { nome: "Encaminhamento", descricao: "Guia de encaminhamento" },
  { nome: "Ficha Pessoal", descricao: "Ficha cadastral do paciente" },
];

export default function EditorPage() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Editor de Impressos</h1>
        <button className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors">Novo Modelo</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {modelos.map((m) => (
          <div key={m.nome} className="bg-white rounded border border-gray-200 p-4 hover:border-primary hover:shadow-sm transition-all cursor-pointer">
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-sm font-medium text-gray-800">{m.nome}</h3>
            <p className="text-xs text-gray-500 mt-1">{m.descricao}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
