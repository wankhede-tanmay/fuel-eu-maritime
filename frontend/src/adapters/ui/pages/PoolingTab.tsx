// frontend/src/adapters/ui/pages/PoolingTab.tsx
import { usePooling } from '../../../core/application/usePooling';

export default function PoolingTab() {
  const {
    year, setYear, availableShips, selectedShipIds, toggleShip,
    currentPoolSum, isValidPool, createPool, poolResult, error, message
  } = usePooling();

  return (
    <div className="space-y-6">
      
      {/* Controls & Notifications */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-end justify-between">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Compliance Year</label>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="border p-2 rounded w-32 bg-slate-50">
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">❌ {error}</div>}
      {message && <div className="bg-green-50 text-green-600 p-4 rounded-lg border border-green-200">✅ {message}</div>}

      <div className="grid grid-cols-2 gap-8">
        {/* Left Column: Selection */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">1. Select Ships for Pool</h2>
          
          {availableShips.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No ships have compliance data for {year} yet. Go to the Banking tab and Check Compliance first!</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {availableShips.map(ship => (
                <label key={ship.shipId} className={`flex items-center p-3 rounded border cursor-pointer transition-colors ${selectedShipIds.has(ship.shipId) ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}>
                  <input type="checkbox" className="mr-3 w-4 h-4" checked={selectedShipIds.has(ship.shipId)} onChange={() => toggleShip(ship.shipId)} />
                  <span className="font-semibold w-20">{ship.shipId}</span>
                  <span className={`ml-auto font-mono text-sm ${ship.cb_before >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ship.cb_before >= 0 ? '+' : ''}{ship.cb_before.toFixed(2)} CB
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Validation & Execution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">2. Validate & Create</h2>
          
          <div className="flex-1 bg-slate-50 rounded p-6 flex flex-col items-center justify-center border border-slate-100">
            <div className="text-sm text-slate-500 font-semibold mb-2">Projected Pool Sum</div>
            <div className={`text-4xl font-black ${currentPoolSum >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {currentPoolSum >= 0 ? '+' : ''}{currentPoolSum.toFixed(2)}
            </div>
            <div className="mt-4 text-sm text-center text-slate-600">
              Selected: <strong>{selectedShipIds.size} ships</strong> <br/>
              Status: {isValidPool ? <span className="text-green-600 font-bold">Valid</span> : <span className="text-red-600 font-bold">Invalid (Sum &lt; 0 or Ships &lt; 2)</span>}
            </div>
          </div>

          <button 
            onClick={createPool}
            disabled={!isValidPool}
            className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Execute Pooling Allocation
          </button>
        </div>
      </div>

      {/* Result Table */}
      {poolResult && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-800 p-4 text-white font-bold">
            Pool #{poolResult.poolId} Allocation Results
          </div>
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="p-4">Ship ID</th>
                <th className="p-4">CB Before Pool</th>
                <th className="p-4">CB After Pool (Exiting)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {poolResult.members.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">{m.ship_id}</td>
                  <td className={`p-4 font-mono ${m.cb_before >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {m.cb_before.toFixed(2)}
                  </td>
                  <td className={`p-4 font-mono font-bold ${m.cb_after >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {m.cb_after.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}