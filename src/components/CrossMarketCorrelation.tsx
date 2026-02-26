import React from 'react';
import { Layers } from 'lucide-react';

export default function CrossMarketCorrelation() {
  const assets = ['S&P 500', 'Gold', 'DXY', 'Oil', 'BTC', 'EUR/USD'];
  
  // Mock correlation matrix (1.0 to -1.0)
  const matrix = [
    [1.00, -0.45, -0.82, 0.35, 0.65, 0.78],
    [-0.45, 1.00, -0.65, 0.20, 0.15, 0.55],
    [-0.82, -0.65, 1.00, -0.40, -0.55, -0.95],
    [0.35, 0.20, -0.40, 1.00, 0.10, 0.30],
    [0.65, 0.15, -0.55, 0.10, 1.00, 0.45],
    [0.78, 0.55, -0.95, 0.30, 0.45, 1.00],
  ];

  const getColor = (val: number) => {
    if (val === 1) return 'bg-white/5 text-gray-500';
    if (val > 0.7) return 'bg-emerald-500/30 text-emerald-400';
    if (val > 0.3) return 'bg-emerald-500/10 text-emerald-400/70';
    if (val > -0.3) return 'bg-white/5 text-gray-400';
    if (val > -0.7) return 'bg-red-500/10 text-red-400/70';
    return 'bg-red-500/30 text-red-400';
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-lg overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Cross-Market Correlation
        </h3>
        <span className="text-xs text-gray-500 font-mono">30-DAY ROLLING</span>
      </div>

      <div className="min-w-[600px]">
        <div className="grid grid-cols-7 gap-1 mb-1">
          <div className="p-2"></div>
          {assets.map(asset => (
            <div key={asset} className="p-2 text-center text-xs font-medium text-gray-400">{asset}</div>
          ))}
        </div>
        
        {assets.map((rowAsset, i) => (
          <div key={rowAsset} className="grid grid-cols-7 gap-1 mb-1">
            <div className="p-2 flex items-center justify-end text-xs font-medium text-gray-400 pr-4">
              {rowAsset}
            </div>
            {matrix[i].map((val, j) => (
              <div 
                key={`${i}-${j}`} 
                className={`p-3 rounded-lg flex items-center justify-center text-xs font-mono transition-colors hover:opacity-80 cursor-pointer ${getColor(val)}`}
                title={`${rowAsset} vs ${assets[j]}: ${val.toFixed(2)}`}
              >
                {val.toFixed(2)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
