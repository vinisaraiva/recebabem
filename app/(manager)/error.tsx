'use client'

/**
 * Error boundary para a área do gerente.
 */
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
      <p className="text-5xl mb-4">⚠️</p>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Erro ao carregar página</h2>
      <p className="text-gray-500 text-sm mb-6">Tente novamente ou contate o suporte.</p>
      <button onClick={reset} className="btn-primary px-6">
        Tentar novamente
      </button>
    </div>
  )
}
