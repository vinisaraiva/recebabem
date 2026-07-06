/**
 * Skeleton de carregamento para toda a área do gerente.
 */
export default function Loading() {
  return (
    <div className="p-6 max-w-3xl animate-pulse">
      {/* Título */}
      <div className="h-8 bg-gray-200 rounded-xl w-48 mb-6" />

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card h-24 bg-gray-100 rounded-2xl" />
        ))}
      </div>

      {/* Seção label */}
      <div className="h-5 bg-gray-200 rounded w-36 mb-3" />

      {/* Lista */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="card h-14 mb-2 bg-gray-100 rounded-2xl" />
      ))}
    </div>
  )
}
