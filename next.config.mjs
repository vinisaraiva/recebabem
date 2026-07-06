/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilita React strict mode para detectar problemas cedo
  reactStrictMode: true,

  // Domínios permitidos para carregamento de imagens
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xsgluofechxlcxcvapfu.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },

  // Headers de segurança e PWA
  async headers() {
    return [
      // ── Service Worker ────────────────────────────────────────────────────
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control',          value: 'no-cache' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      // ── Segurança HTTP — aplicado em todas as rotas ───────────────────────
      {
        source: '/(.*)',
        headers: [
          // Impede clickjacking — nenhum site pode embutir o app em <iframe>
          { key: 'X-Frame-Options',        value: 'DENY' },
          // Impede MIME-sniffing — browser respeita o Content-Type declarado
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Não vaza a URL completa em Referer ao navegar para outros domínios
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          // Desabilita recursos sensíveis não utilizados pelo app
          {
            key:   'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // Desabilita detecção automática de DNS por terceiros
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
        ],
      },
    ]
  },
}

export default nextConfig
