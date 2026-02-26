import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SentimentData {
  bullish: { asset: string; score: number; trend: string }[];
  bearish: { asset: string; score: number; trend: string }[];
}

export default function SentimentCard() {
  const [data, setData] = useState<SentimentData | null>(null);

  useEffect(() => {
    fetch('/api/sentiment')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />;

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          AI Sentiment
        </h3>
        <span className="text-xs text-gray-500 font-mono">UPDATED 15M AGO</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Top Bullish</h4>
          <div className="space-y-3">
            {data.bullish.slice(0, 3).map((item) => (
              <div key={item.asset} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{item.asset}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.score}%` }} />
                  </div>
                  <span className="text-xs font-mono text-emerald-400">+{item.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Top Bearish</h4>
          <div className="space-y-3">
            {data.bearish.slice(0, 3).map((item) => (
              <div key={item.asset} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{item.asset}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden flex justify-end">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.abs(item.score)}%` }} />
                  </div>
                  <span className="text-xs font-mono text-red-400">{item.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
