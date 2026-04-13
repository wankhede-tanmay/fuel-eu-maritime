// frontend/src/App.tsx
import BankingTab from './adapters/ui/pages/BankingTab';
import CompareTab from './adapters/ui/pages/CompareTab';
import { useState } from 'react';
import RoutesTab from './adapters/ui/pages/RoutesTab';
import PoolingTab from './adapters/ui/pages/PoolingTab';

function App() {
  const [activeTab, setActiveTab] = useState('routes');

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">🚢 Fuel EU Maritime Dashboard</h1>
          <p className="text-slate-500 mt-2">Compliance, Banking, and Pooling Management System</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-lg w-max">
          {['routes', 'compare', 'banking', 'pooling'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-md text-sm font-semibold capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Rendering */}
        <div className="mt-6">
          {activeTab === 'routes' && <RoutesTab />}
          {activeTab === 'compare' && <CompareTab />}
          {activeTab === 'banking' && <BankingTab />}
         {activeTab === 'pooling' && <PoolingTab />}
        </div>

      </div>
    </div>
  );
}

export default App;