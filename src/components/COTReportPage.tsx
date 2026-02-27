import React, { useEffect, useState } from 'react';
import { ArrowLeft, BarChart2, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Sidebar from './Sidebar';

interface COTRow {
    market: string;
    long: number;
    longChange: number;
    short: number;
    shortChange: number;
    longPct: number;
    shortPct: number;
    netPositions: number;
    netChange: string;
    netChangePct: string;
    index: number;
}

interface COTCategory {
    category: string;
    rows: COTRow[];
}

interface COTReport {
    reportDate: string;
    categories: COTCategory[];
}

export default function COTReportPage() {
    const [report, setReport] = useState<COTReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [sortCol, setSortCol] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const marketToSymbol: Record<string, string> = {
        'EURO FX (EUR)': 'EUR', 'BRITISH POUND (GBP)': 'GBP', 'JAPANESE YEN (JPY)': 'JPY',
        'US DOLLAR INDEX (USD)': 'USD', 'S&P 500 E-Mini': 'SP500', 'Nasdaq 100 E-Mini': 'NASDAQ',
        'Dow Industrial 30 E-Mini': 'DOW', 'Russell 2000 E-Mini': 'RUSSELL',
        '30-Year T-Bond': 'TBOND30', '10-Year T-Note': 'TNOTE10', '5-Year T-Note': 'TNOTE5', '2-Year T-Note': 'TNOTE2',
        'Crude Oil': 'OIL', 'Natural Gas': 'GAS',
        'Gold': 'GOLD', 'Silver': 'SILVER',
        'Bitcoin': 'BTC', 'Ethereum': 'ETH',
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = () => {
        setLoading(true);
        fetch('/api/cot-report')
            .then(res => res.json())
            .then(data => { setReport(data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    const getIndexColor = (index: number) => {
        if (index >= 80) return 'text-emerald-400 bg-emerald-500/20';
        if (index >= 60) return 'text-emerald-300 bg-emerald-500/10';
        if (index <= 20) return 'text-red-400 bg-red-500/20';
        if (index <= 40) return 'text-red-300 bg-red-500/10';
        return 'text-gray-400 bg-gray-500/20';
    };

    const getChangeColor = (val: number | string) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        if (num > 0) return 'text-emerald-400';
        if (num < 0) return 'text-red-400';
        return 'text-gray-400';
    };

    const formatNum = (n: number) => n.toLocaleString();

    const getCategoryLineColor = (cat: string) => {
        const colors: Record<string, string> = {
            'Currencies': 'border-l-blue-500',
            'Indices': 'border-l-purple-500',
            'Bonds': 'border-l-amber-500',
            'Energy': 'border-l-orange-500',
            'Metals': 'border-l-yellow-500',
            'Grains': 'border-l-green-500',
            'Crypto': 'border-l-cyan-500',
        };
        return colors[cat] || 'border-l-gray-500';
    };

    const getCategoryBgColor = (cat: string) => {
        const colors: Record<string, string> = {
            'Currencies': 'bg-blue-500/10 text-blue-400',
            'Indices': 'bg-purple-500/10 text-purple-400',
            'Bonds': 'bg-amber-500/10 text-amber-400',
            'Energy': 'bg-orange-500/10 text-orange-400',
            'Metals': 'bg-yellow-500/10 text-yellow-400',
            'Grains': 'bg-green-500/10 text-green-400',
            'Crypto': 'bg-cyan-500/10 text-cyan-400',
        };
        return colors[cat] || 'bg-gray-500/10 text-gray-400';
    };

    return (
        <div className="flex min-h-screen bg-[#0a0a0a] text-gray-100 font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="border-b border-white/10 bg-[#0B111A]">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="p-2 -ml-2 text-gray-400 rounded-lg hover:bg-white/5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div>
                                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-indigo-400">Commitments Of Traders</span>
                                    <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                                        COT Report Data, Charts & Index
                                    </h1>
                                </div>
                            </div>
                            <button
                                onClick={fetchReport}
                                className="sm:ml-auto w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mt-4 sm:mt-0">
                            Live market positioning data derived from real-time price action and momentum indicators.
                            Updated continuously during market hours.
                        </p>
                        {report && (
                            <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-500">
                                <span>Report Date: <span className="text-gray-300 font-mono">{report.reportDate}</span></span>
                                <span className="hidden sm:inline">•</span>
                                <span>Last Update: <span className="text-gray-300 font-mono">{new Date().toLocaleTimeString()}</span></span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="max-w-[1400px] mx-auto px-6 py-6 overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex items-center gap-3 text-gray-400">
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span className="text-sm">Loading COT Report data...</span>
                            </div>
                        </div>
                    ) : !report ? (
                        <div className="flex justify-center py-20 text-gray-500">
                            No COT data available. Check server connection.
                        </div>
                    ) : (
                        <div className="bg-[#0D1117] border border-white/10 rounded-xl overflow-hidden min-w-[800px]">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#131A24] border-b border-white/10">
                                        <th className="text-left px-5 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 border-b border-white/10">Market</th>
                                        <th className="text-right px-3 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 border-b border-white/10">Long Positions</th>
                                        <th className="text-right px-3 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 border-b border-white/10">Change</th>
                                        <th className="text-right px-3 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 border-b border-white/10">Short Positions</th>
                                        <th className="text-right px-3 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 border-b border-white/10">Change</th>
                                        <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 border-b border-white/10 w-32">L/S Balance</th>
                                        <th className="text-right px-3 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 border-b border-white/10">Net Position</th>
                                        <th className="text-right px-3 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 border-b border-white/10">Change</th>
                                        <th className="text-center px-3 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 border-b border-white/10 min-w-[70px]">COT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.categories.map((category) => (
                                        <React.Fragment key={category.category}>
                                            {/* Category Header */}
                                            <tr className="bg-[#0B111A]">
                                                <td colSpan={9} className={`px-4 py-2 border-l-2 ${getCategoryLineColor(category.category)}`}>
                                                    <span className={`inline-flex items-center text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getCategoryBgColor(category.category)}`}>
                                                        {category.category}
                                                    </span>
                                                </td>
                                            </tr>
                                            {/* Data Rows */}
                                            {category.rows.map((row, rowIndex) => (
                                                <tr
                                                    key={row.market}
                                                    onClick={() => { const sym = marketToSymbol[row.market]; if (sym) navigate(`/cot-report/${sym}`); }}
                                                    className={`
                                            cursor-pointer transition-colors border-b border-white/5 hover:bg-white/[0.04]
                                            ${rowIndex % 2 === 0 ? 'bg-[#0D1117]' : 'bg-[#0F1520]'}
                                        `}
                                                >
                                                    <td className="px-5 py-2.5 font-medium flex items-center gap-2">
                                                        <BarChart2 className="w-3.5 h-3.5 text-gray-500" />
                                                        {row.market}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-right font-mono text-gray-300 tabular-nums">
                                                        {formatNum(row.long)}
                                                    </td>
                                                    <td className={`px-3 py-2.5 text-right font-mono text-xs tabular-nums ${getChangeColor(row.longChange)}`}>
                                                        {row.longChange > 0 ? '+' : ''}{formatNum(row.longChange)}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-right font-mono text-gray-300 tabular-nums">
                                                        {formatNum(row.short)}
                                                    </td>
                                                    <td className={`px-3 py-2.5 text-right font-mono text-xs tabular-nums ${getChangeColor(row.shortChange)}`}>
                                                        {row.shortChange > 0 ? '+' : ''}{formatNum(row.shortChange)}
                                                    </td>
                                                    {/* Balance Bar */}
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[10px] text-emerald-400 w-7 text-right font-mono">{row.longPct}%</span>
                                                            <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden flex">
                                                                <div
                                                                    className="h-full bg-emerald-500/80 rounded-l-full"
                                                                    style={{ width: `${row.longPct}%` }}
                                                                />
                                                                <div
                                                                    className="h-full bg-red-500/80 rounded-r-full"
                                                                    style={{ width: `${row.shortPct}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] text-red-400 w-7 font-mono">{row.shortPct}%</span>
                                                        </div>
                                                    </td>
                                                    <td className={`px-3 py-2.5 text-right font-mono font-bold tabular-nums ${row.netPositions >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {formatNum(row.netPositions)}
                                                    </td>
                                                    <td className={`px-3 py-2.5 text-right font-mono text-xs tabular-nums ${getChangeColor(row.netChangePct)}`}>
                                                        {row.netChangePct}
                                                    </td>
                                                    {/* COT Index */}
                                                    <td className="px-3 py-2.5 text-center">
                                                        <span className={`inline-flex items-center justify-center w-10 h-6 rounded text-xs font-bold font-mono ${getIndexColor(row.index)}`}>
                                                            {row.index}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="max-w-[1400px] mx-auto px-6 pb-8 w-full">
                    <div className="mt-6 flex flex-wrap gap-6 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
                            <span>Bullish (Index ≥ 60)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
                            <span>Bearish (Index ≤ 40)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-white/5 border border-white/10" />
                            <span>Neutral (41-59)</span>
                        </div>
                        <div className="ml-auto text-gray-600">
                            Data derived from real-time market momentum indicators via Yahoo Finance
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
