"use client";

export default function MensagensPage() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Mensagens</h1>
        <button className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors">Nova Mensagem</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded border border-gray-200 p-4 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-sm font-medium text-gray-800">Email</h3>
          <p className="text-xs text-gray-500 mt-1">Enviar mensagem por email</p>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4 text-center">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <h3 className="text-sm font-medium text-gray-800">WhatsApp</h3>
          <p className="text-xs text-gray-500 mt-1">Enviar mensagem via WhatsApp</p>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4 text-center">
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-sm font-medium text-gray-800">SMS</h3>
          <p className="text-xs text-gray-500 mt-1">Enviar mensagem por SMS</p>
        </div>
      </div>
      <div className="bg-white rounded border border-gray-200 mt-4">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Mensagens Enviadas</h2>
        </div>
        <div className="px-4 py-12 text-center text-gray-400 text-sm">Nenhuma mensagem enviada</div>
      </div>
    </div>
  );
}
