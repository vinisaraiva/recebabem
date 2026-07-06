/**
 * Layout das páginas de autenticação (login, register, convite, acesso).
 * Fundo azul escuro com padrão sutil, card branco centralizado.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: '#0D47A1' }}
    >
      {/* Círculos decorativos sutis — sem glassmorphism */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
        style={{ backgroundColor: '#1565C0' }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full opacity-10"
        style={{ backgroundColor: '#00897B' }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">R</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Receba<span style={{ color: '#4DB6AC' }}>Bem</span>
          </h1>
          <p className="text-blue-300 text-sm mt-1.5 font-medium">
            Inglês para Hotelaria · Porto Seguro
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {children}
        </div>

        <p className="text-center text-blue-400/60 text-xs mt-6">
          © {new Date().getFullYear()} RecebaBem. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
