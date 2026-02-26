import express from "express";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mock Data Generators for Dashboard
  app.get("/api/market-overview", (req, res) => {
    res.json([
      { symbol: "BTC", price: 64230.5, change24h: 2.4, isPositive: true },
      { symbol: "Gold", price: 2340.1, change24h: 0.8, isPositive: true },
      { symbol: "EUR/USD", price: 1.0845, change24h: -0.15, isPositive: false },
      { symbol: "S&P 500", price: 5230.4, change24h: 1.2, isPositive: true },
      { symbol: "Oil", price: 82.4, change24h: -1.1, isPositive: false },
      { symbol: "DXY", price: 104.2, change24h: 0.3, isPositive: true },
    ]);
  });

  app.get("/api/sentiment", (req, res) => {
    res.json({
      bullish: [
        { asset: "Bitcoin", score: 85, trend: "improving" },
        { asset: "Gold", score: 72, trend: "stable" },
        { asset: "S&P 500", score: 68, trend: "improving" },
        { asset: "Copper", score: 65, trend: "stable" },
        { asset: "NASDAQ", score: 62, trend: "improving" },
      ],
      bearish: [
        { asset: "EUR/USD", score: -55, trend: "deteriorating" },
        { asset: "Oil", score: -48, trend: "stable" },
        { asset: "JPY", score: -42, trend: "deteriorating" },
        { asset: "Natural Gas", score: -38, trend: "stable" },
        { asset: "Silver", score: -25, trend: "deteriorating" },
      ]
    });
  });

  app.get("/api/news", (req, res) => {
    res.json([
      {
        article_id: "1",
        headline: "Fed Signals Potential Rate Cut in September",
        summary: "Federal Reserve officials indicated a strong possibility of a rate cut in the upcoming September meeting, citing cooling inflation.",
        source: "Reuters",
        published_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        asset_tags: ["S&P 500", "DXY", "Gold"],
        sentiment: "BULLISH",
        sentiment_score: 0.85,
        impact_level: "HIGH"
      },
      {
        article_id: "2",
        headline: "ECB Maintains Current Interest Rates",
        summary: "The European Central Bank decided to keep interest rates unchanged, adopting a wait-and-see approach.",
        source: "Bloomberg",
        published_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        asset_tags: ["EUR/USD"],
        sentiment: "NEUTRAL",
        sentiment_score: 0.5,
        impact_level: "MEDIUM"
      },
      {
        article_id: "3",
        headline: "Oil Prices Dip on Weak Demand Forecasts",
        summary: "Crude oil futures fell 1.5% today following a report projecting weaker global demand in the second half of the year.",
        source: "AP",
        published_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        asset_tags: ["Oil", "WTI Crude"],
        sentiment: "BEARISH",
        sentiment_score: 0.75,
        impact_level: "MEDIUM"
      }
    ]);
  });

  app.get("/api/economic-calendar", (req, res) => {
    res.json([
      { id: "1", event: "Nonfarm Payrolls", country: "US", currency: "USD", time: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), forecast: "180K", previous: "175K", impact: "HIGH" },
      { id: "2", event: "CPI y/y", country: "EU", currency: "EUR", time: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), forecast: "2.4%", previous: "2.4%", impact: "HIGH" },
      { id: "3", event: "Retail Sales m/m", country: "UK", currency: "GBP", time: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), forecast: "0.3%", previous: "0.0%", impact: "MEDIUM" },
    ]);
  });

  app.get("/api/cot-heatmap", (req, res) => {
    res.json([
      { asset: "Gold", index: 85, bias: "BULLISH", weeklyChange: "+5%" },
      { asset: "EUR", index: 20, bias: "BEARISH", weeklyChange: "-2%" },
      { asset: "S&P 500", index: 65, bias: "BULLISH", weeklyChange: "+1%" },
      { asset: "Oil", index: 40, bias: "NEUTRAL", weeklyChange: "-4%" },
      { asset: "JPY", index: 10, bias: "BEARISH", weeklyChange: "-1%" },
      { asset: "Bitcoin", index: 90, bias: "BULLISH", weeklyChange: "+8%" },
    ]);
  });

  app.get("/api/cot-overview", (req, res) => {
    res.json([
      { asset: "Gold", netPosition: 245000, weeklyChange: "+12,500", index: 85, bias: "BULLISH" },
      { asset: "EUR", netPosition: -45000, weeklyChange: "-5,200", index: 20, bias: "BEARISH" },
      { asset: "S&P 500", netPosition: 120000, weeklyChange: "+8,000", index: 65, bias: "BULLISH" },
      { asset: "Oil", netPosition: 15000, weeklyChange: "-1,500", index: 40, bias: "NEUTRAL" },
      { asset: "JPY", netPosition: -85000, weeklyChange: "-12,000", index: 10, bias: "BEARISH" },
      { asset: "Bitcoin", netPosition: 18000, weeklyChange: "+2,500", index: 90, bias: "BULLISH" },
    ]);
  });

  app.get("/api/anomalies", (req, res) => {
    res.json([
      { id: "1", asset: "JPY", type: "Price Anomaly", description: "3 std dev move detected", time: "10 mins ago" },
      { id: "2", asset: "Gold", type: "Volume Spike", description: "300% of 20-day avg volume", time: "1 hour ago" },
      { id: "3", asset: "S&P 500", type: "Options Flow", description: "Unusual put activity detected", time: "2 hours ago" },
    ]);
  });

  app.get("/api/seasonality", (req, res) => {
    res.json([
      { asset: "Gold", bias: "BULLISH", winRate: "75%", description: "Strong historical performance in current month." },
      { asset: "S&P 500", bias: "BULLISH", winRate: "68%", description: "Positive seasonal trend." },
      { asset: "Oil", bias: "BEARISH", winRate: "60%", description: "Typically weak during this period." },
    ]);
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
