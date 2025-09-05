export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">Página não encontrada</p>
        <a
          href="/"
          className="mt-6 inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Voltar ao início
        </a>
      </div>
    </div>
  )
}
