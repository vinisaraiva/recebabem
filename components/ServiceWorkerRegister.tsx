/**
 * Registra o Service Worker quando o app carrega.
 * Componente client-side, importado no layout raiz.
 */
'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[SW] Registrado:', reg.scope)
        })
        .catch((err) => {
          console.error('[SW] Falha no registro:', err)
        })
    }
  }, [])

  // Componente invisível — só executa o efeito
  return null
}
