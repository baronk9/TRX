import React from 'react';
import { 
  LayoutGrid, 
  Newspaper, 
  Calendar, 
  FileText, 
  BarChart2, 
  Shield, 
  BarChart, 
  BookOpen, 
  MessageSquare, 
  Cloud, 
  Download 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  return (
    <aside 
      className={`flex-shrink-0 border-r border-white/10 bg-[#0B111A] h-screen sticky top-0 overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-0 border-r-0'
      }`}
    >
      <div className="w-64 flex flex-col h-full overflow-y-auto custom-scrollbar">
        <div className="p-4 flex-1">
          {/* MAIN Section */}
          <div className="mb-6">
            <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2 px-3">Main</h4>
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1A222C] text-white border border-white/5 shadow-sm">
                <LayoutGrid className="w-5 h-5 text-[#00d2ff]" />
                <span className="font-medium text-sm">Dashboard</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#94A3B8] hover:text-gray-200 hover:bg-white/5 transition-colors">
                <Newspaper className="w-5 h-5" />
                <span className="font-medium text-sm">News Feed</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#94A3B8] hover:text-gray-200 hover:bg-white/5 transition-colors">
                <Calendar className="w-5 h-5" />
                <span className="font-medium text-sm">Calendar</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#94A3B8] hover:text-gray-200 hover:bg-white/5 transition-colors">
                <FileText className="w-5 h-5" />
                <span className="font-medium text-sm">Reports</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#94A3B8] hover:text-gray-200 hover:bg-white/5 transition-colors">
                <BarChart2 className="w-5 h-5" />
                <span className="font-medium text-sm">COT Data</span>
              </a>
            </nav>
          </div>

          {/* PRODUCTS Section */}
          <div className="mb-6">
            <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2 px-3">Products</h4>
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#94A3B8] hover:text-gray-200 hover:bg-white/5 transition-colors">
                <Shield className="w-5 h-5" />
                <span className="font-medium text-sm">Risk Checker</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#94A3B8] hover:text-gray-200 hover:bg-white/5 transition-colors">
                <BarChart className="w-5 h-5" />
                <span className="font-medium text-sm">Developer API</span>
              </a>
            </nav>
          </div>

          {/* OTHER Section */}
          <div>
            <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2 px-3">Other</h4>
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#94A3B8] hover:text-gray-200 hover:bg-white/5 transition-colors">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium text-sm">Learn more</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#94A3B8] hover:text-gray-200 hover:bg-white/5 transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium text-sm">Contact us</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Card */}
        <div className="p-4 mt-auto">
          <div className="bg-[#121820] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white">
                <Cloud className="w-5 h-5 text-gray-400" />
                <span className="font-bold text-sm">Personal</span>
              </div>
              <button className="px-3 py-1 rounded-full border border-white/20 text-xs font-medium text-white hover:bg-white/10 transition-colors">
                Upgrade
              </button>
            </div>
            
            <div className="mb-2">
              <div className="h-1.5 w-full bg-[#1A222C] rounded-full overflow-hidden">
                <div className="h-full bg-[#00d2ff] rounded-full" style={{ width: '63.3%' }}></div>
              </div>
            </div>
            <p className="text-[11px] text-[#94A3B8] mb-4">19 Analyses used of 30</p>
            
            <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">
              <Download className="w-4 h-4" />
              Get the app
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
