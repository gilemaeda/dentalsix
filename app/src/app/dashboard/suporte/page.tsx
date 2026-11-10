"use client";

export default function SuportePage() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">Suporte</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded border border-gray-200 p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Central de Ajuda</h2>
          <p className="text-sm text-gray-500">Acesse artigos e tutoriais sobre como utilizar o DentalSix.</p>
        </div>
        <div className="bg-white rounded border border-gray-200 p-6">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Chat de Suporte</h2>
          <p className="text-sm text-gray-500">Fale com nosso time de suporte técnico em tempo real.</p>
        </div>
        <div className="bg-white rounded border border-gray-200 p-6">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Treinamentos</h2>
          <p className="text-sm text-gray-500">Vídeo-aulas e materiais de treinamento do sistema.</p>
        </div>
        <div className="bg-white rounded border border-gray-200 p-6">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Sobre o Sistema</h2>
          <p className="text-sm text-gray-500">DentalSix v1.0 — Sistema de gestão odontológica</p>
          <p className="text-xs text-gray-400 mt-2">Vector Tecnologia &copy; 2026</p>
        </div>
      </div>
    </div>
  );
}
