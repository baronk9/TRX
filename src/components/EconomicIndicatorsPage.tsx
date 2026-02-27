import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Search, Globe, ChevronDown, Menu } from 'lucide-react';
import Sidebar from './Sidebar';

interface Indicator {
    name: string;
    subtitle: string;
    latest: string | number;
    prev: string | number;
    period: string;
}

interface EconData {
    country: string;
    lastUpdate: string;
    categories: Record<string, Indicator[]>;
}

const CATEGORY_COLORS: Record<string, string> = {
    'Prices': '#22d3ee',
    'Producer Prices': '#a78bfa',
    'Consumer Prices / Inflation': '#f87171',
    'Money & Finance': '#60a5fa',
    'Population & Labor': '#f472b6',
    'National Accounts': '#34d399',
    'Housing & Real Estate Prices': '#fbbf24',
    'Commodities': '#fb923c',
    'External Sector': '#818cf8',
    'Government Sector': '#94a3b8',
    'Industry Sector': '#2dd4bf',
};

export default function EconomicIndicatorsPage() {
    const navigate = useNavigate();
    const [data, setData] = useState<EconData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('Prices');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        fetch('/api/economic-indicators')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    };

    const allCategories = data ? Object.keys(data.categories) : [];

    const getIndicators = (): Indicator[] => {
        if (!data) return [];
        const indicators = data.categories[activeCategory] || [];
        if (!searchTerm) return indicators;
        return indicators.filter(ind =>
            ind.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const getLatestColor = (latest: string | number, prev: string | number) => {
        const l = typeof latest === 'string' ? parseFloat(latest.replace(/[^0-9.-]/g, '')) : latest;
        const p = typeof prev === 'string' ? parseFloat(prev.replace(/[^0-9.-]/g, '')) : prev;
        if (isNaN(l) || isNaN(p)) return 'text-gray-100';
        if (l > p) return 'text-emerald-400';
        if (l < p) return 'text-red-400';
        return 'text-gray-100';
    };

    const indicators = getIndicators();

    if (loading && !data) return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mr-3" />
                <span className="text-sm text-gray-400">Loading economic indicators...</span>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#060B12] text-gray-100 font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="border-b border-white/10 bg-[#0B111A]">
                    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-4 sm:py-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="p-2 -ml-2 text-gray-400 rounded-lg hover:bg-white/5"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                                <button onClick={() => navigate('/')} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div className="flex-1">
                                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-cyan-400">Economic Data</span>
                                    <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5 flex items-center gap-2 sm:gap-3">
                                        <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                                        {data?.country || 'U.S.'} Economic Indicators
                                    </h1>
                                </div>
                            </div>
                            <button onClick={fetchData} className="sm:ml-auto w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors">
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6 w-full">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                        {/* Main Table */}
                        <div className="xl:col-span-9 order-2 xl:order-1">
                            <div className="bg-[#0D1117] border border-white/10 rounded-xl overflow-hidden">
                                {/* Table Header */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm min-w-[500px]">
                                        <thead>
                                            <tr className="bg-[#131A24]">
                                                <th className="text-left px-5 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 border-b border-white/10 min-w-[250px] sm:min-w-[320px]">Names</th>
                                                <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-emerald-400 border-b border-white/10">Latest</th>
                                                <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 border-b border-white/10">Prev</th>
                                                <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 border-b border-white/10">Period</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {indicators.map((ind, idx) => (
                                                <tr key={ind.name} className={`border-b border-white/5 hover:bg-white/[0.04] transition-colors ${idx % 2 === 0 ? 'bg-[#0D1117]' : 'bg-[#0F1520]'}`}>
                                                    <td className="px-3 sm:px-5 py-3">
                                                        <div className="font-medium text-gray-100">{ind.name}</div>
                                                        <div className="text-[10px] text-gray-500 mt-0.5">{ind.subtitle}</div>
                                                    </td>
                                                    <td className={`px-3 sm:px-4 py-3 text-right font-mono font-bold tabular-nums ${getLatestColor(ind.latest, ind.prev)}`}>
                                                        {ind.latest}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3 text-right font-mono text-gray-400 tabular-nums">
                                                        {ind.prev}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3 text-right text-xs text-gray-500 whitespace-nowrap">
                                                        {ind.period}
                                                    </td>
                                                </tr>
                                            ))}
                                            {indicators.length === 0 && (
                                                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-500 text-sm">No indicators found</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar: Filters */}
                        <div className="xl:col-span-3 order-1 xl:order-2">
                            <div className="bg-[#0D1117] border border-white/10 rounded-xl p-4 xl:sticky top-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <h3 className="text-sm font-bold text-cyan-400">Filters</h3>
                                    <span className="text-xs text-gray-500 ml-auto cursor-pointer hover:text-gray-300">Watchlist</span>
                                </div>
                                <div className="relative mb-5">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search indicators..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-[#131A24] text-white border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors placeholder-gray-500"
                                    />
                                </div>

                                <div className="flex flex-col gap-1 max-h-[400px] xl:max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar pr-2">
                                    {allCategories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`
                                                flex justify-between items-center w-full px-3 py-2.5 rounded-lg text-left text-sm transition-colors border-l-2
                                                ${activeCategory === cat ? 'bg-cyan-500/10 text-white border-cyan-400 font-semibold' : 'text-gray-400 hover:bg-white/5 border-transparent hover:text-gray-200'}
                                            `}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <div className="w-1.5 h-1.5 rounded-full min-w-[6px]" style={{ backgroundColor: CATEGORY_COLORS[cat] || '#64748b' }} />
                                                <span className="truncate">{cat}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-500 bg-black/20 px-1.5 py-0.5 rounded-md min-w-[20px] text-center ml-2">
                                                {data?.categories[cat]?.length || 0}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
