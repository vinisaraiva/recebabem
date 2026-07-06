/**
 * Layout raiz — aplica fonte, meta tags PWA e o provider global.
 * Todos os outros layouts herdam deste.
 */
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import './globals.css'

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

export const metadata: Metadata = {
  title: {
    default:  'RecebaBem',
    template: '%s | RecebaBem',
  },
  description: 'Treinamento de inglês prático para hotelaria em Porto Seguro',
  manifest:    '/manifest.json',
  icons: {
    icon:  [
      { url: '/icons/icon-32x32.png',   sizes: '32x32'   },
      { url: '/icons/icon-192x192.png', sizes: '192x192' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  // Open Graph para compartilhamento
  openGraph: {
    type:        'website',
    siteName:    'RecebaBem',
    title:       'RecebaBem — Inglês para Hotelaria',
    description: 'Treinamento gamificado de inglês para hotéis em Porto Seguro',
  },
}

export const viewport: Viewport = {
  themeColor:           '#1565C0',
  width:                'device-width',
  initialScale:         1,
  maximumScale:         1,
  userScalable:         false,
  viewportFit:          'cover',  // suporte a notch (iPhone)
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-brand-sand">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
