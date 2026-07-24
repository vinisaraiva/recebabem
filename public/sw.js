/**
 * Service Worker do RecebaBem
 *
 * Estratégias de cache:
 *  - App shell (HTML/CSS/JS Next.js) → Cache First (instalado no install)
 *  - API Supabase → Network First (dados frescos, fallback offline)
 *  - Imagens → Stale While Revalidate (carregamento rápido + atualização em bg)
 *
 * Push Notifications são recebidas aqui e exibidas mesmo com app fechado.
 */

const CACHE_VERSION   = 'v1'
const CACHE_STATIC    = `recebabem-static-${CACHE_VERSION}`
const CACHE_DYNAMIC   = `recebabem-dynamic-${CACHE_VERSION}`
const CACHE_IMAGES    = `recebabem-images-${CACHE_VERSION}`

// Arquivos estáticos essenciais (não inclui HTML — navegações são bypass)
const STATIC_ASSETS = [
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// ─── Install: pré-carrega o app shell ────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      console.log('[SW] Pré-cacheando app shell')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  // Força ativação imediata sem esperar abas antigas fecharem
  self.skipWaiting()
})

// ─── Activate: limpa caches antigos ──────────────────────────────────────────

self.addEventListener('activate', (event) => {
  const validCaches = [CACHE_STATIC, CACHE_DYNAMIC, CACHE_IMAGES]

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !validCaches.includes(key))
          .map((key) => {
            console.log('[SW] Removendo cache antigo:', key)
            return caches.delete(key)
          })
      )
    )
  )
  // Assume controle de todas as abas imediatamente
  self.clients.claim()
})

// ─── Fetch: intercepta requisições ───────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignora requisições não-GET e extensões do browser
  if (request.method !== 'GET') return
  if (url.protocol === 'chrome-extension:') return

  // Navegações HTML (Next.js redireciona entre rotas) → browser lida nativamente
  if (request.mode === 'navigate') return

  // Imagens → Stale While Revalidate
  if (isImageRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_IMAGES))
    return
  }

  // API Supabase → Network First (offline fallback: retorna erro JSON)
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirst(request))
    return
  }

  // Assets estáticos (JS/CSS/fonts) → Cache First
  event.respondWith(cacheFirst(request, CACHE_STATIC))
})

// ─── Estratégias de cache ─────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return offlineFallback(request)
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return cached ?? offlineFallback(request)
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request)

  const networkFetch = fetch(request).then((response) => {
    if (response.ok) {
      const clone = response.clone() // clonar antes do gap async (body seria consumido)
      caches.open(cacheName).then((cache) => cache.put(request, clone))
    }
    return response
  })

  return cached ?? networkFetch
}

function isImageRequest(url) {
  return (
    url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i) ||
    url.hostname === 'images.unsplash.com' ||
    url.pathname.includes('/storage/v1/object')
  )
}

function offlineFallback(request) {
  const url = new URL(request.url)

  // Para requisições de página → página offline
  if (request.headers.get('Accept')?.includes('text/html')) {
    return caches.match('/offline') ?? new Response('Offline', { status: 503 })
  }

  // Para API → resposta JSON de erro
  if (url.hostname.includes('supabase.co')) {
    return new Response(
      JSON.stringify({ error: 'offline', message: 'Sem conexão com a internet' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response('Offline', { status: 503 })
}

// ─── Push Notifications ───────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return

  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { title: 'RecebaBem', body: event.data.text() }
  }

  const options = {
    body:    data.body   ?? 'Você tem uma nova notificação',
    icon:    data.icon   ?? '/icons/icon-192x192.png',
    badge:   data.badge  ?? '/icons/badge-72x72.png',
    tag:     data.tag    ?? 'recebabem-push',
    data:    data.data   ?? {},
    actions: data.actions ?? [],
    vibrate: [200, 100, 200],
  }

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'RecebaBem', options)
  )
})

// Clique na notificação → abre o app na URL correta
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url ?? '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Se já tem uma aba aberta, foca e navega
      const existing = clients.find((c) => c.url.includes(self.location.origin))
      if (existing) {
        existing.focus()
        return existing.navigate(url)
      }
      // Caso contrário, abre nova aba
      return self.clients.openWindow(url)
    })
  )
})
