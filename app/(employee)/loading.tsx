/**
 * Skeleton de carregamento para toda a área do funcionário.
 * Exibido enquanto qualquer página do grupo (employee) carrega.
 */
export default function Loading() {
  return (
    <div className="px-4 pt-8 pb-4 max-w-md mx-auto animate-pulse">
      {/* Saudação */}
      <div className="h-7 bg-gray-200 rounded-xl w-44 mb-1.5" />
      <div className="h-4 bg-gray-100 rounded-lg w-36 mb-6" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card h-[72px] bg-gray-100 rounded-2xl" />
        <div className="card h-[72px] bg-gray-100 rounded-2xl" />
      </div>

      {/* Seção label */}
      <div className="h-5 bg-gray-200 rounded w-28 mb-3" />

      {/* Lista de itens */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="card h-[68px] mb-3 bg-gray-100 rounded-2xl" />
      ))}
    </div>
  )
}
