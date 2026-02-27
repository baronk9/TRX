import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Menu } from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
    PieChart, Pie, Cell
} from 'recharts';
import Sidebar from './Sidebar';

const COLORS = {
    emerald: '#34d399', red: '#f87171', amber: '#fbbf24',
    blue: '#60a5fa', purple: '#a78bfa', cyan: '#22d3ee',
    orange: '#fb923c', gray: '#6b7280'
};

const PIE_COLORS = [COLORS.emerald, COLORS.red, COLORS.amber, COLORS.blue, COLORS.purple];

export default function COTAssetDetailPage() {
    const { symbol } = useParams<{ symbol: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!symbol) return;
        setLoading(true);
        fetch(`/api/cot-detail/${symbol}`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [symbol]);

    const fmt = (n: number) => n?.toLocaleString() ?? '0';
    const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n?.toFixed(1)}%`;

    if (loading) return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
        </div>
    );

    if (!data) return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex items-center justify-center text-gray-400">
                Failed to load data
            </div>
        </div>
    );

    const legacyTotal = {
        long: data.legacy.commercials.long + data.legacy.largeSpeculators.long + data.legacy.smallTraders.long,
        short: data.legacy.commercials.short + data.legacy.largeSpeculators.short + data.legacy.smallTraders.short,
    };

    const legacyPieData = [
        { name: 'Commercials', value: data.legacy.commercials.long + data.legacy.commercials.short },
        { name: 'Large Specs', value: data.legacy.largeSpeculators.long + data.legacy.largeSpeculators.short },
        { name: 'Small Traders', value: data.legacy.smallTraders.long + data.legacy.smallTraders.short },
    ];

    const tffPieData = [
        { name: 'Dealer', value: data.tff.dealerIntermediary.long + data.tff.dealerIntermediary.short },
        { name: 'Asset Mgr', value: data.tff.assetManager.long + data.tff.assetManager.short },
        { name: 'Leveraged', value: data.tff.leveragedFunds.long + data.tff.leveragedFunds.short },
        { name: 'Other', value: data.tff.otherReportables.long + data.tff.otherReportables.short },
        { name: 'Non-Report', value: data.tff.nonreportable.long + data.tff.nonreportable.short },
    ];

    const indexColor = (idx: number) => {
        if (idx >= 70) return 'text-emerald-400';
        if (idx <= 30) return 'text-red-400';
        return 'text-amber-400';
    };

    return (
        <div className="flex min-h-screen bg-[#060B12] text-gray-100 font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="border-b border-white/10 bg-[#0B111A]">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="p-2 -ml-2 text-gray-400 rounded-lg hover:bg-white/5"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                                <button onClick={() => navigate('/cot-report')} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div className="flex-1">
                                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-indigo-400">Commitments Of Traders</span>
                                    <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                                        {data.name} <span className="text-gray-500 text-base sm:text-lg">({data.symbol})</span>
                                    </h1>
                                </div>
                            </div>
                            <div className="sm:text-right mt-2 sm:mt-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                                <div className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center gap-3 sm:block">
                                    <span className="sm:hidden text-sm text-gray-500 font-sans">Price:</span>
                                    {data.price?.toFixed(2)}
                                </div>
                                <div className={`text-sm font-mono ${data.changePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {data.changePct >= 0 ? '+' : ''}{data.change?.toFixed(2)} ({fmtPct(data.changePct)})
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 w-full">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                        {/* LEFT: Charts */}
                        <div className="xl:col-span-5 space-y-5">
                            {/* Price Chart */}
                            <div className="bg-[#0D1117] border border-white/10 rounded-xl p-4">
                                <h3 className="text-sm font-bold text-gray-300 mb-3">Price Chart</h3>
                                <div className="overflow-hidden">
                                    <ResponsiveContainer width="100%" height={180}>
                                        <AreaChart data={data.priceHistory}>
                                            <defs>
                                                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={d => d?.slice(5)} />
                                            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} width={40} />
                                            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 12 }} />
                                            <Area type="monotone" dataKey="close" stroke={COLORS.blue} fill="url(#priceGrad)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Net Positions Chart */}
                            <div className="bg-[#0D1117] border border-white/10 rounded-xl p-4">
                                <h3 className="text-sm font-bold text-gray-300 mb-3">Legacy – Net Positions</h3>
                                <div className="overflow-hidden">
                                    <ResponsiveContainer width="100%" height={180}>
                                        <LineChart data={data.netHistory}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={d => d?.slice(5)} />
                                            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={40} />
                                            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 12 }} />
                                            <Legend wrapperStyle={{ fontSize: 10 }} />
                                            <Line type="monotone" dataKey="commercials" stroke={COLORS.emerald} strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="largeSpecs" stroke={COLORS.red} strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="smallTraders" stroke={COLORS.amber} strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* COT Index Chart */}
                            <div className="bg-[#0D1117] border border-white/10 rounded-xl p-4">
                                <h3 className="text-sm font-bold text-gray-300 mb-3">COT Index</h3>
                                <div className="overflow-hidden">
                                    <ResponsiveContainer width="100%" height={160}>
                                        <AreaChart data={data.cotHistory}>
                                            <defs>
                                                <linearGradient id="cotGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={d => d?.slice(5)} />
                                            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} width={25} />
                                            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 12 }} />
                                            <Area type="monotone" dataKey="index" stroke={COLORS.cyan} fill="url(#cotGrad)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Tables & Insights */}
                        <div className="xl:col-span-7 space-y-5 overflow-x-hidden">

                            {/* COT Index Gauges */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#0D1117] border border-white/10 rounded-xl p-4 sm:p-5 text-center">
                                    <div className={`text-3xl sm:text-5xl font-bold font-mono ${indexColor(data.index6m)}`}>{data.index6m}%</div>
                                    <div className="text-[10px] sm:text-xs text-gray-500 mt-2 uppercase tracking-wider">COT Index 6 Month</div>
                                </div>
                                <div className="bg-[#0D1117] border border-white/10 rounded-xl p-4 sm:p-5 text-center">
                                    <div className={`text-3xl sm:text-5xl font-bold font-mono ${indexColor(data.index36m)}`}>{data.index36m}%</div>
                                    <div className="text-[10px] sm:text-xs text-gray-500 mt-2 uppercase tracking-wider">COT Index 36 Month</div>
                                </div>
                            </div>

                            {/* COT Legacy Report Table */}
                            <div className="bg-[#0D1117] border border-white/10 rounded-xl overflow-hidden">
                                <div className="px-4 py-3 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <h3 className="text-sm font-bold text-gray-200">COT Legacy Report – {data.name}</h3>
                                    <span className="text-[10px] text-gray-500">{data.reportDate}</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs min-w-[700px]">
                                        <thead>
                                            <tr className="bg-[#131A24] text-gray-400">
                                                <th className="px-3 py-2 text-left font-bold uppercase text-[10px]">COT Legacy</th>
                                                <th className="px-3 py-2 text-right font-bold uppercase text-[10px] text-emerald-400" colSpan={2}>Commercials</th>
                                                <th className="px-3 py-2 text-right font-bold uppercase text-[10px] text-red-400" colSpan={2}>Large Speculators</th>
                                                <th className="px-3 py-2 text-right font-bold uppercase text-[10px] text-amber-400" colSpan={2}>Small Traders</th>
                                                <th className="px-3 py-2 text-right font-bold uppercase text-[10px]" colSpan={2}>Total</th>
                                            </tr>
                                            <tr className="bg-[#131A24] text-gray-500 border-b border-white/10">
                                                <th className="px-3 py-1 text-left text-[10px]"></th>
                                                <th className="px-3 py-1 text-right text-[10px]">Long</th>
                                                <th className="px-3 py-1 text-right text-[10px]">Short</th>
                                                <th className="px-3 py-1 text-right text-[10px]">Long</th>
                                                <th className="px-3 py-1 text-right text-[10px]">Short</th>
                                                <th className="px-3 py-1 text-right text-[10px]">Long</th>
                                                <th className="px-3 py-1 text-right text-[10px]">Short</th>
                                                <th className="px-3 py-1 text-right text-[10px]">Long</th>
                                                <th className="px-3 py-1 text-right text-[10px]">Short</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                                                <td className="px-3 py-2 font-medium text-gray-300">Positions</td>
                                                <td className="px-3 py-2 text-right font-mono text-emerald-400">{fmt(data.legacy.commercials.long)}</td>
                                                <td className="px-3 py-2 text-right font-mono text-red-400">{fmt(data.legacy.commercials.short)}</td>
                                                <td className="px-3 py-2 text-right font-mono text-emerald-400">{fmt(data.legacy.largeSpeculators.long)}</td>
                                                <td className="px-3 py-2 text-right font-mono text-red-400">{fmt(data.legacy.largeSpeculators.short)}</td>
                                                <td className="px-3 py-2 text-right font-mono text-emerald-400">{fmt(data.legacy.smallTraders.long)}</td>
                                                <td className="px-3 py-2 text-right font-mono text-red-400">{fmt(data.legacy.smallTraders.short)}</td>
                                                <td className="px-3 py-2 text-right font-mono text-emerald-400">{fmt(legacyTotal.long)}</td>
                                                <td className="px-3 py-2 text-right font-mono text-red-400">{fmt(legacyTotal.short)}</td>
                                            </tr>
                                            <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                                                <td className="px-3 py-2 font-medium text-gray-300">Net Positions</td>
                                                <td className="px-3 py-2 text-right font-mono font-bold" colSpan={2}>
                                                    <span className={data.legacy.commercials.long - data.legacy.commercials.short >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                                        {fmt(data.legacy.commercials.long - data.legacy.commercials.short)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-right font-mono font-bold" colSpan={2}>
                                                    <span className={data.legacy.largeSpeculators.long - data.legacy.largeSpeculators.short >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                                        {fmt(data.legacy.largeSpeculators.long - data.legacy.largeSpeculators.short)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-right font-mono font-bold" colSpan={2}>
                                                    <span className={data.legacy.smallTraders.long - data.legacy.smallTraders.short >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                                        {fmt(data.legacy.smallTraders.long - data.legacy.smallTraders.short)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-right font-mono font-bold" colSpan={2}>
                                                    <span className={legacyTotal.long - legacyTotal.short >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                                        {fmt(legacyTotal.long - legacyTotal.short)}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Legacy Insights Pie Charts */}
                            <div className="bg-[#0D1117] border border-white/10 rounded-xl p-4">
                                <h3 className="text-sm font-bold text-gray-300 mb-3">COT Legacy Insights</h3>
                                <div className="flex items-center justify-around flex-wrap gap-2">
                                    {legacyPieData.map((entry, i) => (
                                        <div key={entry.name} className="text-center">
                                            <ResponsiveContainer width={70} height={70}>
                                                <PieChart>
                                                    <Pie data={[entry, { name: 'rest', value: legacyPieData.reduce((s, e) => s + e.value, 0) - entry.value }]}
                                                        cx="50%" cy="50%" innerRadius={20} outerRadius={30} dataKey="value" startAngle={90} endAngle={-270}>
                                                        <Cell fill={PIE_COLORS[i]} />
                                                        <Cell fill="#1e293b" />
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="text-[10px] text-gray-400 mt-1">{entry.name}</div>
                                            <div className="text-xs font-bold font-mono" style={{ color: PIE_COLORS[i] }}>{Math.round(entry.value / legacyPieData.reduce((s, e) => s + e.value, 0) * 100)}%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* TFF Report */}
                            <div className="bg-[#0D1117] border border-white/10 rounded-xl overflow-hidden">
                                <div className="px-4 py-3 border-b border-white/10">
                                    <h3 className="text-sm font-bold text-gray-200">Traders in Financial Futures (TFF)</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs min-w-[500px]">
                                        <thead>
                                            <tr className="bg-[#131A24] text-gray-400 border-b border-white/10">
                                                <th className="px-3 py-2 text-left font-bold uppercase text-[10px]">Category</th>
                                                <th className="px-3 py-2 text-right font-bold uppercase text-[10px] text-emerald-400">Long</th>
                                                <th className="px-3 py-2 text-right font-bold uppercase text-[10px] text-red-400">Short</th>
                                                <th className="px-3 py-2 text-right font-bold uppercase text-[10px] text-amber-400">Spread</th>
                                                <th className="px-3 py-2 text-right font-bold uppercase text-[10px]">Net</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { label: 'Dealer Intermediary', d: data.tff.dealerIntermediary },
                                                { label: 'Asset Manager', d: data.tff.assetManager },
                                                { label: 'Leveraged Funds', d: data.tff.leveragedFunds },
                                                { label: 'Other Reportables', d: data.tff.otherReportables },
                                                { label: 'Nonreportable', d: data.tff.nonreportable },
                                            ].map(row => (
                                                <tr key={row.label} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                    <td className="px-3 py-2 font-medium text-gray-300">{row.label}</td>
                                                    <td className="px-3 py-2 text-right font-mono text-emerald-400">{fmt(row.d.long)}</td>
                                                    <td className="px-3 py-2 text-right font-mono text-red-400">{fmt(row.d.short)}</td>
                                                    <td className="px-3 py-2 text-right font-mono text-amber-400">{fmt(row.d.spread)}</td>
                                                    <td className={`px-3 py-2 text-right font-mono font-bold ${row.d.long - row.d.short >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {fmt(row.d.long - row.d.short)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* TFF Insights Pie Charts */}
                            <div className="bg-[#0D1117] border border-white/10 rounded-xl p-4">
                                <h3 className="text-sm font-bold text-gray-300 mb-3">COT TFF Insights</h3>
                                <div className="flex items-center justify-around flex-wrap gap-2">
                                    {tffPieData.map((entry, i) => (
                                        <div key={entry.name} className="text-center">
                                            <ResponsiveContainer width={70} height={70}>
                                                <PieChart>
                                                    <Pie data={[entry, { name: 'rest', value: tffPieData.reduce((s, e) => s + e.value, 0) - entry.value }]}
                                                        cx="50%" cy="50%" innerRadius={20} outerRadius={30} dataKey="value" startAngle={90} endAngle={-270}>
                                                        <Cell fill={PIE_COLORS[i]} />
                                                        <Cell fill="#1e293b" />
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="text-[10px] text-gray-400 mt-1">{entry.name}</div>
                                            <div className="text-xs font-bold font-mono" style={{ color: PIE_COLORS[i] }}>{Math.round(entry.value / tffPieData.reduce((s, e) => s + e.value, 0) * 100)}%</div>
                                        </div>
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
