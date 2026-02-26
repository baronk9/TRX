import React, { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';

interface COTData {
  asset: string;
  index: number;
  bias: string;
  weeklyChange: string;
}

export default function COTHeatmap() {
  const [data, setData] = useState<COTData[]>([]);

  useEffect(() => {
    fetch('/api/cot-heatmap')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const getColor = (index: number) => {
    if (index >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (index >= 60) return 'bg-emerald-500/10 text-emerald-400/80 border-emerald-500/20';
    if (index <= 20) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (index <= 40) return 'bg-red-500/10 text-red-400/80 border-red-500/20';
    return 'bg-white/5 text-gray-400 border-white/10';
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          COT Positioning
        </h3>
        <span className="text-xs text-gray-500 font-mono">WEEKLY (FRI)</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {data.map((item) => (
          <div key={item.asset} className={`p-3 rounded-xl border ${getColor(item.index)} flex flex-col items-center justify-center text-center transition-colors hover:bg-opacity-30 cursor-pointer`}>
            <span className="text-xs font-medium mb-1">{item.asset}</span>
            <span className="text-lg font-mono font-bold">{item.index}</span>
            <span className="text-[10px] opacity-70 mt-1">{item.weeklyChange}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
