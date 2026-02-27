import React, { useEffect, useState } from 'react';
import { Bell, Search, User, Activity, TrendingUp, AlertTriangle, Calendar, BarChart2, Globe, Layers, Menu } from 'lucide-react';
import MarketOverview from './MarketOverview';
import SentimentCard from './SentimentCard';
import COTHeatmap from './COTHeatmap';
import NewsFeed from './NewsFeed';
import EconomicCalendar from './EconomicCalendar';
import SeasonalityCard from './SeasonalityCard';
import AnomalyAlerts from './AnomalyAlerts';
import CrossMarketCorrelation from './CrossMarketCorrelation';
import COTOverviewTable from './COTOverviewTable';
import Sidebar from './Sidebar';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sidebar is hidden by default and toggleable
  useEffect(() => {
    // Intentionally empty: Sidebar requires user interaction to open
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-indigo-500/30">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Navigation Bar */}
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                title="Toggle Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white hidden sm:block">MarketMind <span className="text-indigo-400">AI</span></span>
              </div>
            </div>

            <div className="flex-1 max-w-md mx-8 hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets, news, or events..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Pro Tier
              </span>
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0a0a]"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>

        {/* Market Overview Strip */}
        <MarketOverview />

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Left Column (Main Analysis) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SentimentCard />
                  <COTHeatmap />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SeasonalityCard />
                  <AnomalyAlerts />
                </div>

                <CrossMarketCorrelation />

                <COTOverviewTable />
              </div>

              {/* Right Column (Feeds & Events) */}
              <div className="lg:col-span-4 space-y-6">
                <NewsFeed />
                <EconomicCalendar />
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
