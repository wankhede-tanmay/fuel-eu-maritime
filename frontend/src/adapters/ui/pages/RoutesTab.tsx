// frontend/src/adapters/ui/pages/RoutesTab.tsx
import { useState } from 'react';
import { useRoutes } from '../../../core/application/useRoutes';
import { Filter } from 'lucide-react'; 

export default function RoutesTab() {
  const { routes, loading, setBaseline } = useRoutes();
  
  // Filter States
  const [vesselFilter, setVesselFilter] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading route data...</div>;

  // Apply the filters to our data
  const filteredRoutes = routes.filter(route => {
    return (
      (vesselFilter === '' || route.vesselType === vesselFilter) &&
      (fuelFilter === '' || route.fuelType === fuelFilter) &&
      (yearFilter === '' || route.year.toString() === yearFilter)
    );
  });

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-center space-x-4">
        <Filter className="text-slate-400 w-5 h-5" />
        <span className="font-semibold text-slate-700">Filters:</span>
        
        <select className="border border-slate-200 rounded p-2 text-sm text-slate-700" value={vesselFilter} onChange={(e) => setVesselFilter(e.target.value)}>
          <option value="">All Vessels</option>
          <option value="Container">Container</option>
          <option value="BulkCarrier">BulkCarrier</option>
          <option value="Tanker">Tanker</option>
          <option value="RoRo">RoRo</option>
        </select>

        <select className="border border-slate-200 rounded p-2 text-sm text-slate-700" value={fuelFilter} onChange={(e) => setFuelFilter(e.target.value)}>
          <option value="">All Fuels</option>
          <option value="HFO">HFO</option>
          <option value="LNG">LNG</option>
          <option value="MGO">MGO</option>
        </select>

        <select className="border border-slate-200 rounded p-2 text-sm text-slate-700" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="">All Years</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
      </div>

      {/* Tailwind Styled Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs">
            <tr>
              <th className="p-4">Route ID</th>
              <th className="p-4">Vessel</th>
              <th className="p-4">Fuel</th>
              <th className="p-4">Year</th>
              <th className="p-4">GHG Intensity</th>
              <th className="p-4">Fuel Cons. (t)</th>
              <th className="p-4">Distance (km)</th>
              <th className="p-4">Total Emis. (t)</th>
              <th className="p-4 text-center">Baseline?</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRoutes.map((route) => (
              <tr key={route.routeId} className={`hover:bg-slate-50 transition-colors ${route.isBaseline ? 'bg-blue-50/50' : ''}`}>
                <td className="p-4 font-bold text-slate-800">{route.routeId}</td>
                <td className="p-4">{route.vesselType}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    route.fuelType === 'LNG' ? 'bg-cyan-100 text-cyan-800' :
                    route.fuelType === 'HFO' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {route.fuelType}
                  </span>
                </td>
                <td className="p-4">{route.year}</td>
                <td className="p-4 font-mono">{Number(route.ghgIntensity).toFixed(2)}</td>
                <td className="p-4 font-mono">{route.fuelConsumption.toLocaleString()}</td>
                <td className="p-4 font-mono">{route.distance.toLocaleString()}</td>
                <td className="p-4 font-mono">{route.totalEmissions.toLocaleString()}</td>
                <td className="p-4 text-center">
                  {route.isBaseline ? <span className="text-yellow-500 text-lg">⭐</span> : <span className="text-slate-300">-</span>}
                </td>
                <td className="p-4 text-center">
                  {!route.isBaseline && (
                    <button 
                      onClick={() => setBaseline(route.routeId)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                    >
                      Set Baseline
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredRoutes.length === 0 && (
              <tr><td colSpan={10} className="p-8 text-center text-slate-400">No routes match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}