import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { createChart, ColorType } from "lightweight-charts";
import {
  TrendingUp,
  TrendingDown,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";

export default function TradingView() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [leverage, setLeverage] = useState(5);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [isPaperTrading, setIsPaperTrading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(67432.50);

  const pairs = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "DOGE/USDT"];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(255, 255, 255, 0.5)",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.03)" },
        horzLines: { color: "rgba(255, 255, 255, 0.03)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 280,
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      crosshair: {
        vertLine: { color: "rgba(0, 255, 136, 0.3)" },
        horzLine: { color: "rgba(0, 255, 136, 0.3)" },
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#00ff88",
      downColor: "#ff3366",
      borderDownColor: "#ff3366",
      borderUpColor: "#00ff88",
      wickDownColor: "#ff3366",
      wickUpColor: "#00ff88",
    });

    // Generate sample candlestick data
    const generateData = () => {
      const data = [];
      let basePrice = 67000;
      const now = Math.floor(Date.now() / 1000);
      for (let i = 100; i >= 0; i--) {
        const time = now - i * 3600;
        const open = basePrice + (Math.random() - 0.5) * 500;
        const close = open + (Math.random() - 0.5) * 400;
        const high = Math.max(open, close) + Math.random() * 200;
        const low = Math.min(open, close) - Math.random() * 200;
        data.push({ time, open, high, low, close });
        basePrice = close;
      }
      return data;
    };

    candleSeries.setData(generateData() as any);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [selectedPair]);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prev) => prev + (Math.random() - 0.5) * 50);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">التداول</h1>
          <p className="text-muted-foreground text-xs">تداول يدوي سريع</p>
        </div>
        {/* Paper Trading Toggle */}
        <button
          onClick={() => setIsPaperTrading(!isPaperTrading)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            isPaperTrading
              ? "bg-gold/10 text-gold border border-gold/30"
              : "bg-success/10 text-success border border-success/30"
          }`}
        >
          {isPaperTrading ? <Eye size={12} /> : <EyeOff size={12} />}
          {isPaperTrading ? "تجريبي" : "حقيقي"}
        </button>
      </div>

      {/* Pair Selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {pairs.map((pair) => (
          <button
            key={pair}
            onClick={() => setSelectedPair(pair)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedPair === pair
                ? "bg-success/20 text-success border border-success/30"
                : "bg-white/5 text-muted-foreground border border-white/10"
            }`}
          >
            {pair}
          </button>
        ))}
      </div>

      {/* Current Price */}
      <div className="glass-card p-3 mb-4 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-[10px]">{selectedPair}</p>
          <p className="text-white text-lg font-bold">${currentPrice.toFixed(2)}</p>
        </div>
        <div className="text-left">
          <span className="text-success text-xs">+1.24%</span>
          <p className="text-muted-foreground text-[10px]">24 ساعة</p>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-2 mb-4 overflow-hidden rounded-2xl">
        <div ref={chartContainerRef} className="w-full" />
      </div>

      {/* Order Form */}
      <div className="glass-card p-4">
        {/* Buy/Sell Toggle */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setSide("buy")}
            className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
              side === "buy"
                ? "bg-success text-navy"
                : "bg-white/5 text-muted-foreground"
            }`}
          >
            <TrendingUp size={14} className="inline ml-1" />
            شراء
          </button>
          <button
            onClick={() => setSide("sell")}
            className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
              side === "sell"
                ? "bg-danger text-white"
                : "bg-white/5 text-muted-foreground"
            }`}
          >
            <TrendingDown size={14} className="inline ml-1" />
            بيع
          </button>
        </div>

        {/* Order Type */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setOrderType("market")}
            className={`py-2 rounded-lg text-xs font-medium transition-all ${
              orderType === "market"
                ? "bg-white/10 text-white border border-white/20"
                : "bg-white/5 text-muted-foreground"
            }`}
          >
            سوق (Market)
          </button>
          <button
            onClick={() => setOrderType("limit")}
            className={`py-2 rounded-lg text-xs font-medium transition-all ${
              orderType === "limit"
                ? "bg-white/10 text-white border border-white/20"
                : "bg-white/5 text-muted-foreground"
            }`}
          >
            محدد (Limit)
          </button>
        </div>

        {/* Leverage */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-xs">الرافعة المالية</span>
            <span className="text-gold text-xs font-bold">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
          />
          <div className="flex justify-between mt-1">
            {[1, 5, 10, 25, 50, 100].map((lev) => (
              <button
                key={lev}
                onClick={() => setLeverage(lev)}
                className={`text-[9px] px-1.5 py-0.5 rounded ${
                  leverage === lev ? "bg-gold/20 text-gold" : "text-muted-foreground"
                }`}
              >
                {lev}x
              </button>
            ))}
          </div>
        </div>

        {/* Price (for limit orders) */}
        {orderType === "limit" && (
          <div className="mb-3">
            <label className="text-muted-foreground text-xs mb-1 block">السعر</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={currentPrice.toFixed(2)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-success/50"
            />
          </div>
        )}

        {/* Amount */}
        <div className="mb-4">
          <label className="text-muted-foreground text-xs mb-1 block">المبلغ (USDT)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-success/50"
          />
          <div className="flex gap-2 mt-2">
            {["25%", "50%", "75%", "100%"].map((pct) => (
              <button
                key={pct}
                onClick={() => setAmount((8250 * parseInt(pct) / 100).toFixed(2))}
                className="flex-1 py-1 rounded-lg bg-white/5 text-muted-foreground text-[10px] hover:bg-white/10 transition-all"
              >
                {pct}
              </button>
            ))}
          </div>
        </div>

        {/* Execute Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
            side === "buy"
              ? "bg-success text-navy glow-green"
              : "bg-danger text-white glow-red"
          }`}
        >
          {side === "buy" ? "شراء" : "بيع"} {selectedPair}
          {isPaperTrading && " (تجريبي)"}
        </motion.button>
      </div>
    </div>
  );
}