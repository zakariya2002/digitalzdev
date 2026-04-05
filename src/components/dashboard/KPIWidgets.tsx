interface Widget {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  color: string
}

interface KPIWidgetsProps {
  widgets: Widget[]
}

export default function KPIWidgets({ widgets }: KPIWidgetsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {widgets.map((w, i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{w.label}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${w.color}`}>
              {w.icon}
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{w.value}</p>
          {w.sub && <p className="text-xs text-gray-500 mt-1">{w.sub}</p>}
        </div>
      ))}
    </div>
  )
}
