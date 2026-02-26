import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  isPositive: boolean;
}

export default function MarketOverview() {
  const [data, setData] = useState<MarketData[]>([]);

  useEffect(() => {
    fetch('/api/market-overview')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div className="border-b border-white/5 bg-white/[0.02] overflow-x-auto hide-scrollbar">
      <div className="flex items-center min-w-max px-4 py-3 gap-8 text-sm">
        {data.map((item) => (
          <div key={item.symbol} className="flex items-center gap-3">
            <span className="font-medium text-gray-300">{item.symbol}</span>
            <span className="font-mono text-gray-100">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
            <span className={`flex items-center font-mono text-xs ${item.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(item.change24h)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
