/**
 * Skeleton de carregamento para toda a área do admin.
 */
export default function Loading() {
  return (
    <div className="p-6 max-w-4xl animate-pulse">
      {/* Título */}
      <div className="h-8 bg-gray-200 rounded-xl w-52 mb-6" />

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card h-24 bg-gray-100 rounded-2xl" />
        ))}
      </div>

      {/* Tabela skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="h-10 bg-gray-50 border-b border-gray-100" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 border-b border-gray-50 bg-white px-4 flex items-center">
            <div className="h-4 bg-gray-100 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
