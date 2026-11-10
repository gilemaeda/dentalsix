export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="text-lg text-gray-600 mt-4">Página não encontrada</p>
        <a
          href="/dashboard"
          className="inline-block mt-6 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors text-sm"
        >
          Voltar ao início
        </a>
      </div>
    </div>
  );
}
