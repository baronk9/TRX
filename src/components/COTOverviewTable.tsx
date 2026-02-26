import React, { useEffect, useState } from 'react';
import { Table, ArrowUpRight, ArrowDownRight, Minus, ArrowUpDown } from 'lucide-react';

interface COTOverviewData {
  asset: string;
  netPosition: number;
  weeklyChange: string;
  index: number;
  bias: string;
}

type SortField = 'asset' | 'netPosition' | 'weeklyChange' | 'index' | 'bias';
type SortOrder = 'asc' | 'desc';

export default function COTOverviewTable() {
  const [data, setData] = useState<COTOverviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('index');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    const fetchCOTData = async () => {
      try {
        const res = await fetch('/api/cot-overview');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Error fetching COT data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCOTData();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'asset' || sortField === 'bias') {
      comparison = a[sortField].localeCompare(b[sortField]);
    } else if (sortField === 'weeklyChange') {
      const valA = parseFloat(a.weeklyChange.replace(/[,%]/g, ''));
      const valB = parseFloat(b.weeklyChange.replace(/[,%]/g, ''));
      comparison = valA - valB;
    } else {
      comparison = a[sortField] - b[sortField];
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getBiasIcon = (bias: string) => {
    if (bias === 'BULLISH') return <ArrowUpRight className="w-3 h-3" />;
    if (bias === 'BEARISH') return <ArrowDownRight className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getBiasColor = (bias: string) => {
    if (bias === 'BULLISH') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (bias === 'BEARISH') return 'text-red-400 bg-red-400/10 border-red-400/20';
    return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  const getIndexColor = (index: number) => {
    if (index >= 80) return 'text-emerald-400';
    if (index >= 60) return 'text-emerald-400/80';
    if (index <= 20) return 'text-red-400';
    if (index <= 40) return 'text-red-400/80';
    return 'text-gray-400';
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-lg overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Table className="w-5 h-5 text-indigo-400" />
          COT Overview
        </h3>
        <span className="text-xs text-gray-500 font-mono">ALL ASSETS</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <th className="p-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('asset')}>
                <div className="flex items-center gap-1">Asset <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
              </th>
              <th className="p-3 cursor-pointer hover:text-white transition-colors text-right" onClick={() => handleSort('netPosition')}>
                <div className="flex items-center justify-end gap-1">Net Position <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
              </th>
              <th className="p-3 cursor-pointer hover:text-white transition-colors text-right" onClick={() => handleSort('weeklyChange')}>
                <div className="flex items-center justify-end gap-1">Weekly Change <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
              </th>
              <th className="p-3 cursor-pointer hover:text-white transition-colors text-center" onClick={() => handleSort('index')}>
                <div className="flex items-center justify-center gap-1">COT Index <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
              </th>
              <th className="p-3 cursor-pointer hover:text-white transition-colors text-center" onClick={() => handleSort('bias')}>
                <div className="flex items-center justify-center gap-1">Bias <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedData.map((row) => (
              <tr key={row.asset} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-3 font-medium text-gray-200">{row.asset}</td>
                <td className="p-3 text-right font-mono text-gray-300">
                  {row.netPosition.toLocaleString()}
                </td>
                <td className={`p-3 text-right font-mono text-xs ${row.weeklyChange.startsWith('+') ? 'text-emerald-400' : row.weeklyChange.startsWith('-') ? 'text-red-400' : 'text-gray-400'}`}>
                  {row.weeklyChange}
                </td>
                <td className={`p-3 text-center font-mono font-bold ${getIndexColor(row.index)}`}>
                  {row.index}
                </td>
                <td className="p-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getBiasColor(row.bias)}`}>
                    {getBiasIcon(row.bias)}
                    {row.bias}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
