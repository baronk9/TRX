import React, { useEffect, useState } from 'react';
import { AlertTriangle, Activity } from 'lucide-react';

interface AnomalyData {
  id: string;
  asset: string;
  type: string;
  description: string;
  time: string;
}

export default function AnomalyAlerts() {
  const [alerts, setAlerts] = useState<AnomalyData[]>([]);

  useEffect(() => {
    fetch('/api/anomalies')
      .then(res => res.json())
      .then(setAlerts)
      .catch(console.error);
  }, []);

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-indigo-400" />
          Anomaly Alerts
        </h3>
        <span className="flex items-center gap-1.5 text-xs text-red-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          ACTIVE
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors cursor-pointer">
            <div className="mt-0.5 p-1.5 rounded-lg bg-red-500/20 text-red-400">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-gray-200">{alert.asset}</span>
                <span className="text-[10px] text-gray-500 font-mono">{alert.time}</span>
              </div>
              <div className="text-xs font-medium text-red-400 mb-1">{alert.type}</div>
              <p className="text-xs text-gray-400">{alert.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
