import React, { useEffect, useState } from 'react';
import { Globe, Clock, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NewsItem {
  article_id: string;
  headline: string;
  summary: string;
  source: string;
  published_at: string;
  asset_tags: string[];
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sentiment_score: number;
  impact_level: 'HIGH' | 'MEDIUM' | 'LOW';
}

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(setNews)
      .catch(console.error);
  }, []);

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === 'BULLISH') return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
    if (sentiment === 'BEARISH') return <ArrowDownRight className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'BULLISH') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (sentiment === 'BEARISH') return 'text-red-400 bg-red-400/10 border-red-400/20';
    return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-lg h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          Live News Feed
        </h3>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          LIVE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {news.map((item) => (
          <div key={item.article_id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400">{item.source}</span>
                <span className="text-gray-600 text-xs">•</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                </span>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${getSentimentColor(item.sentiment)}`}>
                {getSentimentIcon(item.sentiment)}
                {item.sentiment}
              </div>
            </div>
            
            <h4 className="text-sm font-semibold text-gray-100 mb-2 leading-snug group-hover:text-indigo-300 transition-colors">
              {item.headline}
            </h4>
            
            <p className="text-xs text-gray-400 line-clamp-2 mb-3">
              {item.summary}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {item.asset_tags.map(tag => (
                <span key={tag} className="px-2 py-1 rounded bg-white/5 text-gray-300 text-[10px] font-medium border border-white/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
