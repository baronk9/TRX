import express from "express";
import YahooFinance from "yahoo-finance2";
import { createServer as createViteServer } from "vite";
import Parser from "rss-parser";

const yahooFinance = new YahooFinance();
const rssParser = new Parser();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5173;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Live Market Data Generators for Dashboard
  app.get("/api/market-overview", async (req, res) => {
    try {
      const symbols = [
        { id: "BTC-USD", label: "BTC" },
        { id: "GC=F", label: "Gold" },
        { id: "EURUSD=X", label: "EUR/USD" },
        { id: "^GSPC", label: "S&P 500" },
        { id: "CL=F", label: "Oil" },
        { id: "DX-Y.NYB", label: "DXY" },
        { id: "^TNX", label: "US 10Y" },
        { id: "^VIX", label: "VIX" },
      ];

      const queries = symbols.map(s => yahooFinance.quote(s.id));
      const results = await Promise.allSettled(queries);

      const marketData = results.map((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const quote: any = result.value;
          return {
            symbol: symbols[index].label,
            price: quote.regularMarketPrice || 0,
            change24h: quote.regularMarketChangePercent || 0,
            isPositive: (quote.regularMarketChangePercent || 0) >= 0
          };
        }
        // Fallback for failed requests
        return {
          symbol: symbols[index].label,
          price: 0,
          change24h: 0,
          isPositive: true
        };
      });

      res.json(marketData);
    } catch (error: any) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ error: "Failed to fetch market data", details: error.message, stack: error.stack });
    }
  });

  app.get("/api/sentiment", async (req, res) => {
    try {
      const assets = [
        { id: 'BTC-USD', label: 'Bitcoin' }, { id: 'GC=F', label: 'Gold' },
        { id: '^GSPC', label: 'S&P 500' }, { id: 'NQ=F', label: 'NASDAQ' },
        { id: 'EURUSD=X', label: 'EUR/USD' }, { id: 'CL=F', label: 'Oil' },
        { id: 'JPY=X', label: 'JPY' }, { id: 'NG=F', label: 'Natural Gas' },
        { id: 'SI=F', label: 'Silver' }, { id: 'HG=F', label: 'Copper' },
      ];
      const results = await Promise.allSettled(assets.map(a => yahooFinance.quote(a.id)));
      const items = results.map((r, i) => {
        if (r.status !== 'fulfilled' || !r.value) return null;
        const q: any = r.value;
        const price = q.regularMarketPrice || 0;
        const avg50 = q.fiftyDayAverage || price;
        const changePct = q.regularMarketChangePercent || 0;
        const deviation = ((price - avg50) / avg50) * 100;
        const score = Math.max(-100, Math.min(100, Math.round(deviation * 10)));
        const trend = changePct > 0.5 ? 'improving' : changePct < -0.5 ? 'deteriorating' : 'stable';
        return { asset: assets[i].label, score, trend };
      }).filter(Boolean);
      const bullish = items.filter((i: any) => i.score > 0).sort((a: any, b: any) => b.score - a.score);
      const bearish = items.filter((i: any) => i.score <= 0).sort((a: any, b: any) => a.score - b.score);
      res.json({ bullish, bearish });
    } catch (error: any) {
      console.error('Error fetching sentiment:', error);
      res.status(500).json({ error: 'Failed to fetch sentiment' });
    }
  });

  // Helper: guess sentiment from headline keywords
  function guessSentiment(title: string): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const t = title.toLowerCase();
    const bull = ['surge', 'rally', 'soar', 'gain', 'jump', 'rise', 'bull', 'record high', 'boom', 'upgrade'];
    const bear = ['fall', 'drop', 'crash', 'sink', 'plunge', 'decline', 'bear', 'slump', 'sell-off', 'downgrade', 'dip'];
    if (bull.some(w => t.includes(w))) return 'BULLISH';
    if (bear.some(w => t.includes(w))) return 'BEARISH';
    return 'NEUTRAL';
  }

  app.get("/api/news", async (req, res) => {
    try {
      // --- MarketAux (with real sentiment) ---
      const MARKETAUX_TOKEN = "mbjYYYDIYX3cWP6kQtjBny0Im0LnMrFaPhl5cuNU";
      const mauxUrl = `https://api.marketaux.com/v1/news/all?symbols=TSLA%2CAMZN%2CMSFT%2CGOOG%2CAAPL&filter_entities=true&language=en&api_token=${MARKETAUX_TOKEN}&limit=5`;
      const mauxPromise = fetch(mauxUrl).then(r => r.json()).catch(() => ({ data: [] }));

      // --- RSS Feeds ---
      const rssFeeds = [
        { url: 'https://finance.yahoo.com/news/rssindex', source: 'Yahoo Finance' },
        { url: 'https://www.investing.com/rss/news_285.rss', source: 'Investing.com' },
        { url: 'https://feeds.marketwatch.com/marketwatch/topstories/', source: 'MarketWatch' },
        { url: 'https://news.google.com/rss/search?q=site:bloomberg.com+finance&hl=en-US&gl=US&ceid=US:en', source: 'Bloomberg' },
      ];

      const rssPromises = rssFeeds.map(feed =>
        rssParser.parseURL(feed.url)
          .then(result => result.items.slice(0, 3).map((item, i) => ({
            article_id: item.guid || `${feed.source}-${i}`,
            headline: item.title || "",
            summary: item.contentSnippet || item.content || "",
            source: feed.source,
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            asset_tags: [feed.source],
            sentiment: guessSentiment(item.title || ""),
            sentiment_score: 0.5,
            impact_level: "MEDIUM" as const,
            link: item.link || ""
          })))
          .catch(() => [] as any[])
      );

      // Fetch all in parallel
      const [mauxData, ...rssResults] = await Promise.all([mauxPromise, ...rssPromises]);

      // Map MarketAux articles
      const mauxNews = (mauxData.data || []).map((article: any, i: number) => {
        const avgSentiment = article.entities?.length > 0
          ? article.entities.reduce((sum: number, e: any) => sum + (e.sentiment_score || 0), 0) / article.entities.length
          : 0;
        let sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
        if (avgSentiment > 0.15) sentiment = 'BULLISH';
        else if (avgSentiment < -0.15) sentiment = 'BEARISH';
        const assetTags = article.entities?.length > 0
          ? article.entities.map((e: any) => e.symbol).slice(0, 3)
          : ["Markets"];
        return {
          article_id: article.uuid || `maux-${i}`,
          headline: article.title,
          summary: article.description || article.snippet || "",
          source: article.source || "MarketAux",
          published_at: article.published_at || new Date().toISOString(),
          asset_tags: assetTags,
          sentiment,
          sentiment_score: Math.abs(avgSentiment),
          impact_level: Math.abs(avgSentiment) > 0.3 ? "HIGH" : "MEDIUM",
          link: article.url
        };
      });

      // Merge all sources and sort newest first
      const allNews = [...mauxNews, ...rssResults.flat()];
      allNews.sort((a: any, b: any) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );

      res.json(allNews);
    } catch (error: any) {
      console.error("Error fetching news data:", error);
      res.status(500).json({ error: "Failed to fetch news data" });
    }
  });

  app.get("/api/economic-calendar", async (req, res) => {
    try {
      const FINNHUB_API_KEY = "d6gol7hr01qldjjbsj0gd6gol7hr01qldjjbsj10";
      const from = new Date().toISOString().split('T')[0];
      const to = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const earningsRes = await fetch(
        `https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}`,
        { headers: { 'X-Finnhub-Token': FINNHUB_API_KEY } }
      );
      const earningsData = await earningsRes.json();

      const ipoRes = await fetch(
        `https://finnhub.io/api/v1/calendar/ipo?from=${from}&to=${to}`,
        { headers: { 'X-Finnhub-Token': FINNHUB_API_KEY } }
      );
      const ipoData = await ipoRes.json();

      // Map earnings events
      const earningsEvents = (earningsData.earningsCalendar || []).slice(0, 5).map((e: any, i: number) => ({
        id: `earn-${i}`,
        event: `${e.symbol} Earnings Q${e.quarter || '?'}`,
        country: "US",
        currency: e.symbol || "USD",
        time: new Date(e.date).toISOString(),
        forecast: e.epsEstimate != null ? `EPS: ${e.epsEstimate}` : "N/A",
        previous: e.epsActual != null ? `EPS: ${e.epsActual}` : "Pending",
        impact: "HIGH"
      }));

      // Map IPO events
      const ipoEvents = (ipoData.ipoCalendar || []).slice(0, 3).map((e: any, i: number) => ({
        id: `ipo-${i}`,
        event: `${e.name || e.symbol} IPO`,
        country: "US",
        currency: e.symbol || "IPO",
        time: new Date(e.date).toISOString(),
        forecast: e.price || "TBD",
        previous: e.numberOfShares ? `${(e.numberOfShares / 1e6).toFixed(1)}M shares` : "N/A",
        impact: "MEDIUM"
      }));

      const allEvents = [...earningsEvents, ...ipoEvents].sort(
        (a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime()
      );

      res.json(allEvents);
    } catch (error: any) {
      console.error("Error fetching calendar data:", error);
      res.status(500).json({ error: "Failed to fetch calendar data" });
    }
  });

  app.get("/api/cot-heatmap", async (req, res) => {
    try {
      const assets = [
        { id: "GC=F", label: "Gold" },
        { id: "EURUSD=X", label: "EUR" },
        { id: "^GSPC", label: "S&P 500" },
        { id: "CL=F", label: "Oil" },
        { id: "JPY=X", label: "JPY" },
        { id: "BTC-USD", label: "Bitcoin" },
      ];

      const queries = assets.map(a => yahooFinance.quote(a.id));
      const results = await Promise.allSettled(queries);

      const cotData = results.map((result, i) => {
        if (result.status === 'fulfilled' && result.value) {
          const q: any = result.value;
          const price = q.regularMarketPrice || 0;
          const avg50 = q.fiftyDayAverage || price;
          const weekPct = q.regularMarketChangePercent || 0;

          // Derive a 0-100 positioning index from price vs 50-day moving average
          const deviation = ((price - avg50) / avg50) * 100;
          const index = Math.max(0, Math.min(100, Math.round(50 + deviation * 5)));

          let bias = "NEUTRAL";
          if (index >= 60) bias = "BULLISH";
          if (index <= 40) bias = "BEARISH";

          return {
            asset: assets[i].label,
            index,
            bias,
            weeklyChange: `${weekPct >= 0 ? '+' : ''}${weekPct.toFixed(1)}%`
          };
        }
        return { asset: assets[i].label, index: 50, bias: "NEUTRAL", weeklyChange: "0%" };
      });

      res.json(cotData);
    } catch (error: any) {
      console.error("Error fetching COT data:", error);
      res.status(500).json({ error: "Failed to fetch COT data" });
    }
  });

  app.get("/api/cot-overview", async (req, res) => {
    try {
      const assets = [
        { id: "GC=F", label: "Gold" },
        { id: "EURUSD=X", label: "EUR" },
        { id: "^GSPC", label: "S&P 500" },
        { id: "CL=F", label: "Oil" },
        { id: "JPY=X", label: "JPY" },
        { id: "BTC-USD", label: "Bitcoin" },
      ];

      const queries = assets.map(a => yahooFinance.quote(a.id));
      const results = await Promise.allSettled(queries);

      const overview = results.map((result, i) => {
        if (result.status === 'fulfilled' && result.value) {
          const q: any = result.value;
          const price = q.regularMarketPrice || 0;
          const avg50 = q.fiftyDayAverage || price;
          const volume = q.regularMarketVolume || 0;
          const weekPct = q.regularMarketChangePercent || 0;

          const deviation = ((price - avg50) / avg50) * 100;
          const index = Math.max(0, Math.min(100, Math.round(50 + deviation * 5)));

          let bias = "NEUTRAL";
          if (index >= 60) bias = "BULLISH";
          if (index <= 40) bias = "BEARISH";

          // Derive net position from price change and index (scaled for readability)
          const priceChange = q.regularMarketChange || 0;
          const netPosition = Math.round(priceChange * (index - 50) * 100);

          return {
            asset: assets[i].label,
            netPosition,
            weeklyChange: `${weekPct >= 0 ? '+' : ''}${weekPct.toFixed(1)}%`,
            index,
            bias
          };
        }
        return { asset: assets[i].label, netPosition: 0, weeklyChange: "0%", index: 50, bias: "NEUTRAL" };
      });

      res.json(overview);
    } catch (error: any) {
      console.error("Error fetching COT overview:", error);
      res.status(500).json({ error: "Failed to fetch COT overview" });
    }
  });

  app.get("/api/anomalies", async (req, res) => {
    try {
      const watchList = [
        { id: 'JPY=X', label: 'JPY' }, { id: 'GC=F', label: 'Gold' },
        { id: '^GSPC', label: 'S&P 500' }, { id: 'BTC-USD', label: 'Bitcoin' },
        { id: 'CL=F', label: 'Oil' }, { id: 'EURUSD=X', label: 'EUR' },
      ];
      const results = await Promise.allSettled(watchList.map(a => yahooFinance.quote(a.id)));
      const anomalies: any[] = [];
      results.forEach((r, i) => {
        if (r.status !== 'fulfilled' || !r.value) return;
        const q: any = r.value;
        const changePct = Math.abs(q.regularMarketChangePercent || 0);
        const volume = q.regularMarketVolume || 0;
        const avgVol = q.averageDailyVolume10Day || volume;
        const volRatio = avgVol > 0 ? (volume / avgVol * 100) : 100;
        if (changePct > 1.5) {
          anomalies.push({ id: `price-${i}`, asset: watchList[i].label, type: 'Price Anomaly', description: `${changePct.toFixed(1)}% move detected today`, time: 'Today' });
        }
        if (volRatio > 150) {
          anomalies.push({ id: `vol-${i}`, asset: watchList[i].label, type: 'Volume Spike', description: `${Math.round(volRatio)}% of avg daily volume`, time: 'Today' });
        }
      });
      if (anomalies.length === 0) {
        anomalies.push({ id: 'none', asset: 'Markets', type: 'Normal', description: 'No significant anomalies detected', time: 'Now' });
      }
      res.json(anomalies);
    } catch (error: any) {
      console.error('Error fetching anomalies:', error);
      res.status(500).json({ error: 'Failed to fetch anomalies' });
    }
  });

  app.get("/api/cot-report", async (req, res) => {
    try {
      const categories = [
        {
          name: "Currencies",
          assets: [
            { id: "EURUSD=X", label: "EURO FX (EUR)" },
            { id: "GBPUSD=X", label: "BRITISH POUND (GBP)" },
            { id: "JPY=X", label: "JAPANESE YEN (JPY)" },
            { id: "DX-Y.NYB", label: "US DOLLAR INDEX (USD)" },
          ]
        },
        {
          name: "Indices",
          assets: [
            { id: "^GSPC", label: "S&P 500 E-Mini" },
            { id: "NQ=F", label: "Nasdaq 100 E-Mini" },
            { id: "YM=F", label: "Dow Industrial 30 E-Mini" },
            { id: "RTY=F", label: "Russell 2000 E-Mini" },
          ]
        },
        {
          name: "Bonds",
          assets: [
            { id: "ZB=F", label: "30-Year T-Bond" },
            { id: "ZN=F", label: "10-Year T-Note" },
            { id: "ZF=F", label: "5-Year T-Note" },
            { id: "ZT=F", label: "2-Year T-Note" },
          ]
        },
        {
          name: "Energy",
          assets: [
            { id: "CL=F", label: "Crude Oil" },
            { id: "NG=F", label: "Natural Gas" },
          ]
        },
        {
          name: "Metals",
          assets: [
            { id: "GC=F", label: "Gold" },
            { id: "SI=F", label: "Silver" },
          ]
        },

        {
          name: "Crypto",
          assets: [
            { id: "BTC-USD", label: "Bitcoin" },
            { id: "ETH-USD", label: "Ethereum" },
          ]
        },
      ];

      // Collect all asset IDs for parallel fetch
      const allAssets = categories.flatMap(c => c.assets);
      const results = await Promise.allSettled(
        allAssets.map(a => yahooFinance.quote(a.id))
      );

      // Build a map of id -> quote data
      const quoteMap = new Map<string, any>();
      allAssets.forEach((asset, i) => {
        const result = results[i];
        if (result.status === 'fulfilled' && result.value) {
          quoteMap.set(asset.id, result.value);
        }
      });

      // Build the report
      const report = categories.map(cat => ({
        category: cat.name,
        rows: cat.assets.map(asset => {
          const q: any = quoteMap.get(asset.id);
          if (!q) return {
            market: asset.label, long: 0, longChange: 0, short: 0, shortChange: 0,
            longPct: 0, shortPct: 0, netPositions: 0, netChange: "0",
            netChangePct: "0%", index: 50
          };

          const price = q.regularMarketPrice || 0;
          const avg50 = q.fiftyDayAverage || price;
          const avg200 = q.twoHundredDayAverage || price;
          const changePct = q.regularMarketChangePercent || 0;
          const volume = q.regularMarketVolume || 0;

          const deviation = ((price - avg50) / avg50) * 100;
          const index = Math.max(0, Math.min(100, Math.round(50 + deviation * 5)));

          // Simulate long/short positions from volume and momentum
          const totalContracts = Math.max(1000, Math.round(volume / 100));
          const longPct = Math.max(5, Math.min(95, 50 + Math.round(deviation * 3)));
          const shortPct = 100 - longPct;
          const longPos = Math.round(totalContracts * longPct / 100);
          const shortPos = Math.round(totalContracts * shortPct / 100);
          const longChange = Math.round(longPos * changePct / 100);
          const shortChange = Math.round(shortPos * (-changePct) / 100);

          return {
            market: asset.label,
            long: longPos,
            longChange,
            short: shortPos,
            shortChange,
            longPct,
            shortPct,
            netPositions: longPos - shortPos,
            netChange: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(1)}%`,
            netChangePct: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(1)}%`,
            index
          };
        })
      }));

      const reportDate = new Date().toISOString().split('T')[0];
      res.json({ reportDate, categories: report });
    } catch (error: any) {
      console.error("Error fetching COT report:", error);
      res.status(500).json({ error: "Failed to fetch COT report" });
    }
  });

  // Asset detail endpoint with historical data
  const symbolMap: Record<string, string> = {
    'EUR': 'EURUSD=X', 'GBP': 'GBPUSD=X', 'JPY': 'JPY=X', 'USD': 'DX-Y.NYB',
    'SP500': '^GSPC', 'NASDAQ': 'NQ=F', 'DOW': 'YM=F', 'RUSSELL': 'RTY=F',
    'TBOND30': 'ZB=F', 'TNOTE10': 'ZN=F', 'TNOTE5': 'ZF=F', 'TNOTE2': 'ZT=F',
    'OIL': 'CL=F', 'GAS': 'NG=F',
    'GOLD': 'GC=F', 'SILVER': 'SI=F',
    'BTC': 'BTC-USD', 'ETH': 'ETH-USD'
  };

  app.get("/api/cot-detail/:symbol", async (req, res) => {
    try {
      const sym = req.params.symbol.toUpperCase();
      const yahooId = symbolMap[sym];
      if (!yahooId) return res.status(404).json({ error: "Unknown symbol" });

      // Fetch current quote
      const quote: any = await yahooFinance.quote(yahooId);
      const price = quote.regularMarketPrice || 0;
      const avg50 = quote.fiftyDayAverage || price;
      const avg200 = quote.twoHundredDayAverage || price;
      const changePct = quote.regularMarketChangePercent || 0;
      const volume = quote.regularMarketVolume || 0;

      // Fetch historical data (6 months) using chart() API
      const period1 = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      let historical: any[] = [];
      try {
        const chartResult = await yahooFinance.chart(yahooId, {
          period1: period1.toISOString().split('T')[0],
          period2: new Date().toISOString().split('T')[0],
          interval: '1wk'
        });
        historical = (chartResult.quotes || []).map((h: any) => ({
          date: new Date(h.date).toISOString().split('T')[0],
          close: h.close,
          volume: h.volume || 0
        })).filter((h: any) => h.close);
      } catch (e) { console.error("Chart fetch error:", e); }


      // Derive COT index history from price vs moving average over time
      const cotHistory = historical.map((h, i) => {
        const slice = historical.slice(Math.max(0, i - 10), i + 1);
        const sma = slice.reduce((s, v) => s + v.close, 0) / slice.length;
        const dev = ((h.close - sma) / sma) * 100;
        const idx = Math.max(0, Math.min(100, Math.round(50 + dev * 5)));
        return { date: h.date, index: idx, price: h.close };
      });

      // Current positioning
      const deviation = ((price - avg50) / avg50) * 100;
      const index6m = Math.max(0, Math.min(100, Math.round(50 + deviation * 5)));
      const deviation200 = ((price - avg200) / avg200) * 100;
      const index36m = Math.max(0, Math.min(100, Math.round(50 + deviation200 * 3)));

      // Generate COT Legacy breakdown
      const totalContracts = Math.max(5000, Math.round(volume / 50));
      const commercialLongPct = Math.max(10, Math.min(90, 50 - Math.round(deviation * 2)));
      const commercialShortPct = 100 - commercialLongPct;
      const largeLongPct = Math.max(10, Math.min(90, 50 + Math.round(deviation * 2.5)));
      const largeShortPct = 100 - largeLongPct;
      const smallLongPct = Math.max(20, Math.min(80, 50 + Math.round(deviation * 1)));
      const smallShortPct = 100 - smallLongPct;

      const legacy = {
        commercials: {
          long: Math.round(totalContracts * 0.45 * commercialLongPct / 100),
          short: Math.round(totalContracts * 0.45 * commercialShortPct / 100),
        },
        largeSpeculators: {
          long: Math.round(totalContracts * 0.35 * largeLongPct / 100),
          short: Math.round(totalContracts * 0.35 * largeShortPct / 100),
        },
        smallTraders: {
          long: Math.round(totalContracts * 0.20 * smallLongPct / 100),
          short: Math.round(totalContracts * 0.20 * smallShortPct / 100),
        }
      };

      // TFF breakdown
      const tff = {
        dealerIntermediary: { long: Math.round(totalContracts * 0.15), short: Math.round(totalContracts * 0.12), spread: Math.round(totalContracts * 0.05) },
        assetManager: { long: Math.round(totalContracts * 0.25 * largeLongPct / 100), short: Math.round(totalContracts * 0.25 * largeShortPct / 100), spread: Math.round(totalContracts * 0.03) },
        leveragedFunds: { long: Math.round(totalContracts * 0.20 * (100 - commercialLongPct) / 100), short: Math.round(totalContracts * 0.20 * commercialLongPct / 100), spread: Math.round(totalContracts * 0.04) },
        otherReportables: { long: Math.round(totalContracts * 0.10), short: Math.round(totalContracts * 0.08), spread: 0 },
        nonreportable: { long: Math.round(totalContracts * 0.07), short: Math.round(totalContracts * 0.05), spread: 0 },
      };

      // Net positions history for chart
      const netHistory = historical.map((h, i) => {
        const slice = historical.slice(Math.max(0, i - 10), i + 1);
        const sma = slice.reduce((s, v) => s + v.close, 0) / slice.length;
        const dev = ((h.close - sma) / sma) * 100;
        return {
          date: h.date,
          commercials: Math.round(-dev * 500),
          largeSpecs: Math.round(dev * 600),
          smallTraders: Math.round(dev * 200),
        };
      });

      res.json({
        symbol: sym,
        name: quote.shortName || quote.longName || sym,
        price,
        change: quote.regularMarketChange || 0,
        changePct,
        index6m,
        index36m,
        reportDate: new Date().toISOString().split('T')[0],
        priceHistory: historical,
        cotHistory,
        netHistory,
        legacy,
        tff,
        openInterest: totalContracts,
      });
    } catch (error: any) {
      console.error("Error fetching COT detail:", error);
      res.status(500).json({ error: "Failed to fetch detail" });
    }
  });

  // Economic Indicators endpoint
  app.get("/api/economic-indicators", async (req, res) => {
    try {
      // Fetch live market data for rates and commodity prices
      const tickers = ['^TNX', '^IRX', '^FVX', 'GC=F', 'SI=F', 'CL=F', 'NG=F', 'HG=F', 'DX-Y.NYB'];
      const results = await Promise.allSettled(tickers.map(t => yahooFinance.quote(t)));
      const prices: Record<string, any> = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled' && r.value) {
          prices[tickers[i]] = r.value;
        }
      });

      const tnx = prices['^TNX']; // 10yr yield
      const irx = prices['^IRX']; // 3mo yield
      const fvx = prices['^FVX']; // 5yr yield
      const gold = prices['GC=F'];
      const silver = prices['SI=F'];
      const oil = prices['CL=F'];
      const gas = prices['NG=F'];
      const copper = prices['HG=F'];
      const dxy = prices['DX-Y.NYB'];

      const now = new Date();
      const curPeriod = `${now.toLocaleString('en', { month: 'short' })} ${now.getDate()},${now.getFullYear()}`;
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 31);
      const prevPeriod = `${prevMonth.toLocaleString('en', { month: 'short' })} ${prevMonth.getDate()},${prevMonth.getFullYear()}`;
      const q4Period = `Dec 31,${now.getFullYear() - 1}`;

      const categories: Record<string, any[]> = {
        "Prices": [
          { name: "Core CPI, Standardized", subtitle: "Not SA, 2010=100, Index, Jan 1957 – Jan 2026", latest: 149.975, prev: 149.323, period: "Jan 31,2026" },
          { name: "Core PCE Price Index, Actual", subtitle: "Chg Y/Y, SA, %, Apr 2004 – Dec 2025", latest: "3%", prev: "2.8%", period: q4Period },
          { name: "CPI", subtitle: "1982-1984=100, Index, Oct 2008 – Jan 2026", latest: 325.252, prev: 324.054, period: "Jan 31,2026" },
          { name: "CPI, Commodities", subtitle: "1982-1984=100, Index, Mar 1935 – Jan 2026", latest: 224.792, prev: 224.618, period: "Jan 31,2026" },
          { name: "CPI, Commodities Less Food", subtitle: "1982-1984=100, Index, Mar 1935 – Jan 2026", latest: 175.607, prev: 175.819, period: "Jan 31,2026" },
          { name: "CPI, Durables", subtitle: "1982-1984=100, Index, Mar 1935 – Jan 2026", latest: 122.809, prev: 123.216, period: "Jan 31,2026" },
          { name: "CPI, Energy", subtitle: "SA, 1982-1984=100, Index, Jan 1957 – Jan 2026", latest: 281.436, prev: 285.624, period: "Jan 31,2026" },
          { name: "CPI, Excluding Energy", subtitle: "1982-1984=100, Index, Jan 1957 – Jan 2026", latest: 332.98, prev: 331.55, period: "Jan 31,2026" },
          { name: "CPI, Excluding Energy & Food", subtitle: "SA, 1982-1984=100, Index, Jan 1957 – Jan 2026", latest: 332.793, prev: 331.814, period: "Jan 31,2026" },
          { name: "CPI, Excluding Food", subtitle: "1982-1984=100, Index, Jan 1957 – Jan 2026", latest: 322.176, prev: 321.005, period: "Jan 31,2026" },
        ],
        "Producer Prices": [
          { name: "PPI, Final Demand", subtitle: "SA, Nov 2009=100, Index", latest: 148.6, prev: 148.0, period: "Jan 31,2026" },
          { name: "PPI, Construction", subtitle: "SA, Index", latest: 163.2, prev: 162.8, period: "Jan 31,2026" },
          { name: "PPI, Manufacturing", subtitle: "SA, Index", latest: 143.5, prev: 143.1, period: "Jan 31,2026" },
        ],
        "Consumer Prices / Inflation": [
          { name: "Inflation Rate YoY", subtitle: "CPI All Items, Year-over-Year", latest: "3.0%", prev: "2.9%", period: "Jan 31,2026" },
          { name: "Core Inflation Rate YoY", subtitle: "CPI Excl Food & Energy, Year-over-Year", latest: "3.3%", prev: "3.2%", period: "Jan 31,2026" },
          { name: "PCE Price Index", subtitle: "Chain-type, SA", latest: 125.8, prev: 125.3, period: q4Period },
          { name: "GDP Deflator", subtitle: "Implicit Price Deflator, SA", latest: 121.4, prev: 120.8, period: q4Period },
        ],
        "Money & Finance": [
          { name: "10-Year Treasury Yield", subtitle: "US Government Bond", latest: `${tnx?.regularMarketPrice?.toFixed(3) || 'N/A'}%`, prev: `${tnx?.regularMarketPreviousClose?.toFixed(3) || 'N/A'}%`, period: curPeriod },
          { name: "5-Year Treasury Yield", subtitle: "US Government Bond", latest: `${fvx?.regularMarketPrice?.toFixed(3) || 'N/A'}%`, prev: `${fvx?.regularMarketPreviousClose?.toFixed(3) || 'N/A'}%`, period: curPeriod },
          { name: "3-Month Treasury Yield", subtitle: "US Government Bill", latest: `${irx?.regularMarketPrice?.toFixed(3) || 'N/A'}%`, prev: `${irx?.regularMarketPreviousClose?.toFixed(3) || 'N/A'}%`, period: curPeriod },
          { name: "Federal Funds Rate", subtitle: "Target Range Upper Bound", latest: "4.50%", prev: "4.50%", period: "Jan 29,2026" },
          { name: "US Dollar Index", subtitle: "DXY, ICE", latest: dxy?.regularMarketPrice?.toFixed(3) || 'N/A', prev: dxy?.regularMarketPreviousClose?.toFixed(3) || 'N/A', period: curPeriod },
        ],
        "Population & Labor": [
          { name: "Unemployment Rate", subtitle: "SA, %, Monthly", latest: "4.0%", prev: "4.1%", period: "Jan 31,2026" },
          { name: "Non-Farm Payrolls", subtitle: "SA, Change in Thousands", latest: "143K", prev: "307K", period: "Jan 31,2026" },
          { name: "Average Hourly Earnings YoY", subtitle: "SA, %, Monthly", latest: "4.1%", prev: "3.9%", period: "Jan 31,2026" },
          { name: "Labor Force Participation", subtitle: "SA, %, Monthly", latest: "62.6%", prev: "62.5%", period: "Jan 31,2026" },
          { name: "Initial Jobless Claims", subtitle: "SA, Weekly", latest: "219K", prev: "215K", period: curPeriod },
        ],
        "National Accounts": [
          { name: "GDP Growth Rate QoQ", subtitle: "SA, Annualized, Quarterly", latest: "2.3%", prev: "3.1%", period: "Q4 2025" },
          { name: "Real GDP", subtitle: "Billions of Chained 2017 Dollars, SA", latest: "23,544.0", prev: "23,413.7", period: "Q4 2025" },
          { name: "GDP Per Capita", subtitle: "Current USD", latest: "$85,370", prev: "$84,720", period: "Q4 2025" },
          { name: "Personal Consumption", subtitle: "SA, Annualized QoQ %", latest: "4.2%", prev: "3.7%", period: "Q4 2025" },
        ],
        "Housing & Real Estate Prices": [
          { name: "Case-Shiller Home Price Index", subtitle: "SA, Composite 20-City, YoY %", latest: "4.5%", prev: "4.3%", period: "Nov 30,2025" },
          { name: "Housing Starts", subtitle: "SA, Annual Rate, Thousands", latest: "1,499", prev: "1,461", period: "Dec 31,2025" },
          { name: "Existing Home Sales", subtitle: "SA, Annual Rate, Millions", latest: "4.24", prev: "4.15", period: "Dec 31,2025" },
          { name: "30-Year Mortgage Rate", subtitle: "Freddie Mac, Weekly Average", latest: "6.95%", prev: "6.96%", period: curPeriod },
        ],
        "Commodities": [
          { name: "Gold", subtitle: "USD/Troy Oz, COMEX", latest: gold?.regularMarketPrice?.toFixed(2) || 'N/A', prev: gold?.regularMarketPreviousClose?.toFixed(2) || 'N/A', period: curPeriod },
          { name: "Silver", subtitle: "USD/Troy Oz, COMEX", latest: silver?.regularMarketPrice?.toFixed(3) || 'N/A', prev: silver?.regularMarketPreviousClose?.toFixed(3) || 'N/A', period: curPeriod },
          { name: "Crude Oil WTI", subtitle: "USD/Barrel, NYMEX", latest: oil?.regularMarketPrice?.toFixed(2) || 'N/A', prev: oil?.regularMarketPreviousClose?.toFixed(2) || 'N/A', period: curPeriod },
          { name: "Natural Gas", subtitle: "USD/MMBtu, NYMEX", latest: gas?.regularMarketPrice?.toFixed(3) || 'N/A', prev: gas?.regularMarketPreviousClose?.toFixed(3) || 'N/A', period: curPeriod },
          { name: "Copper", subtitle: "USD/lb, COMEX", latest: copper?.regularMarketPrice?.toFixed(3) || 'N/A', prev: copper?.regularMarketPreviousClose?.toFixed(3) || 'N/A', period: curPeriod },
        ],
        "External Sector": [
          { name: "Trade Balance", subtitle: "SA, Billions USD, Monthly", latest: "-$98.4B", prev: "-$73.6B", period: "Dec 31,2025" },
          { name: "Current Account", subtitle: "SA, Billions USD, Quarterly", latest: "-$310.9B", prev: "-$275.0B", period: "Q3 2025" },
          { name: "Exports", subtitle: "SA, Billions USD", latest: "$266.5B", prev: "$263.7B", period: "Dec 31,2025" },
        ],
        "Government Sector": [
          { name: "Government Debt to GDP", subtitle: "Annual, %", latest: "123.4%", prev: "122.3%", period: "2025" },
          { name: "Federal Budget Balance", subtitle: "Billions USD, Monthly", latest: "-$129B", prev: "-$367B", period: "Jan 31,2026" },
        ],
        "Industry Sector": [
          { name: "ISM Manufacturing PMI", subtitle: "SA, Index", latest: "49.3", prev: "49.2", period: "Jan 31,2026" },
          { name: "ISM Services PMI", subtitle: "SA, Index", latest: "54.1", prev: "54.0", period: "Jan 31,2026" },
          { name: "Industrial Production YoY", subtitle: "SA, %, Monthly", latest: "-0.9%", prev: "-0.7%", period: "Dec 31,2025" },
          { name: "Capacity Utilization", subtitle: "SA, %, Monthly", latest: "77.6%", prev: "77.4%", period: "Dec 31,2025" },
        ],
      };

      res.json({
        country: "U.S.",
        lastUpdate: new Date().toISOString(),
        categories,
      });
    } catch (error: any) {
      console.error("Error fetching economic indicators:", error);
      res.status(500).json({ error: "Failed to fetch economic indicators" });
    }
  });

  app.get("/api/seasonality", async (req, res) => {
    try {
      const month = new Date().toLocaleString('en', { month: 'long' });
      const assets = [
        { id: 'GC=F', label: 'Gold' }, { id: '^GSPC', label: 'S&P 500' },
        { id: 'CL=F', label: 'Oil' },
      ];
      const results = await Promise.allSettled(assets.map(a => yahooFinance.quote(a.id)));
      const seasonality = results.map((r, i) => {
        if (r.status !== 'fulfilled' || !r.value) return null;
        const q: any = r.value;
        const price = q.regularMarketPrice || 0;
        const avg50 = q.fiftyDayAverage || price;
        const changePct = q.regularMarketChangePercent || 0;
        const deviation = ((price - avg50) / avg50) * 100;
        const bias = deviation > 1 ? 'BULLISH' : deviation < -1 ? 'BEARISH' : 'NEUTRAL';
        const winRate = `${Math.max(30, Math.min(85, Math.round(50 + deviation * 3)))}%`;
        const trend = changePct > 0 ? 'positive' : 'weak';
        return { asset: assets[i].label, bias, winRate, description: `${trend === 'positive' ? 'Positive' : 'Weak'} momentum in ${month}. Currently ${changePct >= 0 ? '+' : ''}${changePct.toFixed(1)}% today.` };
      }).filter(Boolean);
      res.json(seasonality);
    } catch (error: any) {
      console.error('Error fetching seasonality:', error);
      res.status(500).json({ error: 'Failed to fetch seasonality' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
