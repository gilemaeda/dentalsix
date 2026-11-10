"use client";

const ferramentas = [
  { nome: "Mala Direta", desc: "Envio em lote de mensagens para pacientes", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { nome: "Importar Pacientes", desc: "Importar dados de pacientes via CSV", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
  { nome: "Exportar Dados", desc: "Exportar dados do sistema", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
  { nome: "Assinaturas Digitais", desc: "Gerenciar assinaturas digitais de documentos", icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" },
  { nome: "Anamnese", desc: "Configurar questionários de anamnese", icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { nome: "Restrição Financeira", desc: "Regras de restrição financeira para pacientes", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
];

export default function FerramentasPage() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">Ferramentas</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ferramentas.map((f) => (
          <div key={f.nome} className="bg-white rounded border border-gray-200 p-4 hover:border-primary hover:shadow-sm transition-all cursor-pointer">
            <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={f.icon} /></svg>
            </div>
            <h3 className="text-sm font-medium text-gray-800">{f.nome}</h3>
            <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
