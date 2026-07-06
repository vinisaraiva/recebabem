/**
 * Layout da área do funcionário.
 * Inclui a barra de navegação inferior (mobile-first, estilo app).
 */
import BottomNav from '@/components/nav/BottomNav'
import { NAV_EMPLOYEE } from '@/lib/constants'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    /*
     * No mobile: ocupa a tela toda (bg-brand-sand).
     * No desktop: fundo cinza-azulado, app-shell de 390px centralizado
     * com sombra — parece o app do celular posicionado na tela.
     */
    <div className="min-h-screen bg-gray-200 md:flex md:items-start md:justify-center">
      <div className="relative w-full md:w-[390px] md:min-h-screen md:shadow-2xl md:shadow-black/20 bg-brand-sand flex flex-col">
        <main className="flex-1 pb-20 safe-bottom">
          {children}
        </main>

        <BottomNav items={NAV_EMPLOYEE} />
      </div>
    </div>
  )
}
