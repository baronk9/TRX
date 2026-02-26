import React, { useEffect, useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface EventData {
  id: string;
  event: string;
  country: string;
  currency: string;
  time: string;
  forecast: string;
  previous: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export default function EconomicCalendar() {
  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    fetch('/api/economic-calendar')
      .then(res => res.json())
      .then(setEvents)
      .catch(console.error);
  }, []);

  const getImpactColor = (impact: string) => {
    if (impact === 'HIGH') return 'bg-red-500';
    if (impact === 'MEDIUM') return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          Economic Calendar
        </h3>
        <span className="text-xs text-gray-500 font-mono">UPCOMING</span>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-white/5 border border-white/10">
                <span className="text-xs font-bold text-gray-300">{format(new Date(event.time), 'MMM')}</span>
                <span className="text-lg font-mono text-white">{format(new Date(event.time), 'dd')}</span>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-white/10 text-gray-300">{event.currency}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full ${
                          (event.impact === 'HIGH' && i <= 3) || 
                          (event.impact === 'MEDIUM' && i <= 2) || 
                          (event.impact === 'LOW' && i <= 1) 
                            ? getImpactColor(event.impact) 
                            : 'bg-white/10'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
                <h4 className="text-sm font-medium text-gray-200">{event.event}</h4>
                <span className="text-xs text-gray-500 font-mono">{format(new Date(event.time), 'HH:mm')} UTC</span>
              </div>
            </div>

            <div className="text-right flex flex-col gap-1">
              <div className="flex items-center justify-end gap-2 text-xs">
                <span className="text-gray-500">Forecast:</span>
                <span className="font-mono text-gray-200">{event.forecast}</span>
              </div>
              <div className="flex items-center justify-end gap-2 text-xs">
                <span className="text-gray-500">Previous:</span>
                <span className="font-mono text-gray-400">{event.previous}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
