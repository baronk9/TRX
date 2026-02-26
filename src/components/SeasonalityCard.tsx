import React, { useEffect, useState } from 'react';
import { BarChart2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SeasonalityData {
  asset: string;
  bias: string;
  winRate: string;
  description: string;
}

export default function SeasonalityCard() {
  const [data, setData] = useState<SeasonalityData[]>([]);

  useEffect(() => {
    fetch('/api/seasonality')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-400" />
          Seasonality
        </h3>
        <span className="text-xs text-gray-500 font-mono">THIS MONTH</span>
      </div>

      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.asset} className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-200">{item.asset}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
                  item.bias === 'BULLISH' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'
                }`}>
                  {item.bias === 'BULLISH' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {item.bias}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Win Rate</span>
                <span className="text-sm font-mono font-bold text-white">{item.winRate}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
