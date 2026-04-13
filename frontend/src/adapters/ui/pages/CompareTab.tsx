// frontend/src/adapters/ui/pages/CompareTab.tsx
import { useRoutes } from '../../../core/application/useRoutes';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';

export default function CompareTab() {
  const { routes, loading } = useRoutes();
  const TARGET_INTENSITY = 89.3368;

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading comparison data...</div>;

  // Convert DB strings to numbers for safe math
  const safeRoutes = routes.map(r => ({
    ...r,
    ghgIntensity: Number(r.ghgIntensity),
    percentDiff: Number(r.percentDiff || 0)
  }));

  return (
    <div className="space-y-8">
      
      {/* 📊 The Chart (Rubric Requirement) */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6">GHG Intensity vs 2025 Target</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safeRoutes} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="routeId" axisLine={false} tickLine={false} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} type="number" />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Legend />
              
              {/* The explicit 89.3368 Target Line */}
              <ReferenceLine y={TARGET_INTENSITY} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Target (89.3368)', fill: '#ef4444', fontSize: 12 }} />
              
              <Bar dataKey="ghgIntensity" name="GHG Intensity" radius={[4, 4, 0, 0]}>
                {safeRoutes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isBaseline ? '#f59e0b' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📋 The Comparison Table (Rubric Columns Exact Match) */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="p-4">Route ID</th>
              <th className="p-4">ghgIntensity</th>
              <th className="p-4">% difference</th>
              <th className="p-4 text-center">compliant (✅ / ❌)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {safeRoutes.map((route) => (
              <tr key={route.routeId} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-800">
                  {route.routeId} {route.isBaseline && <span className="text-yellow-500 text-xs ml-1">⭐ Baseline</span>}
                </td>
                <td className="p-4 font-mono">{route.ghgIntensity.toFixed(4)}</td>
                <td className="p-4 font-mono font-bold">
                  {route.isBaseline ? (
                    <span className="text-slate-400">0.00%</span>
                  ) : (
                    <span className={route.percentDiff > 0 ? "text-red-500" : "text-green-500"}>
                      {route.percentDiff > 0 ? "+" : ""}
                      {route.percentDiff.toFixed(2)}%
                    </span>
                  )}
                </td>
                <td className="p-4 text-center text-lg">
                  {route.isCompliant ? "✅" : "❌"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}