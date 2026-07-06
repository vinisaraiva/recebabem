'use client'
/**
 * Página exibida pelo Service Worker quando o usuário está offline
 * e tenta acessar uma rota não cacheada.
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-brand-sand flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">📶</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sem conexão</h1>
        <p className="text-gray-500 mb-6">
          Você está offline. Algumas funcionalidades podem não estar disponíveis.
        </p>
        <p className="text-gray-400 text-sm">
          Suas missões completadas serão sincronizadas quando a conexão voltar.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary mt-6 inline-flex"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
