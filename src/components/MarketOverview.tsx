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
    const fetchMarketData = () => {
      fetch('/api/market-overview')
        .then(res => res.json())
        .then(setData)
        .catch(console.error);
    };

    fetchMarketData(); // initial fetch
    const intervalId = setInterval(fetchMarketData, 10000); // Poll every 10s

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <div className="border-b border-white/5 bg-white/[0.02] overflow-hidden">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {/* Render two sets of items for seamless infinite scrolling */}
        {[...data, ...data].map((item, index) => (
          <div key={`${item.symbol}-${index}`} className="flex items-center gap-3 px-4 py-3 text-sm min-w-max">
            <span className="font-medium text-gray-300">{item.symbol}</span>
            <span className="font-mono text-gray-100">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={`flex items-center font-mono text-xs ${item.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(item.change24h).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
