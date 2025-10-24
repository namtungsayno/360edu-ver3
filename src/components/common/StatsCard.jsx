export default function StatsCard({ title, value, icon, trend, className = "" }) {
  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        {icon && (
          <div className="text-yellow-500 text-2xl">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={`mt-2 text-sm ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
          {trend.positive ? '↗' : '↘'} {trend.value}
        </div>
      )}
    </div>
  );
}
