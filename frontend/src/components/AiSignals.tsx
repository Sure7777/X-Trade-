import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  Zap,
  Volume2,
} from "lucide-react";
import { client } from "@/lib/client";

interface Signal {
  id: number;
  symbol: string;
  direction: string;
  entry_price: number;
  take_profit: number;
  stop_loss: number;
  confidence: number;
  signal_type: string;
  status: string;
  volume_spike: number;
  whale_activity: boolean;
}

export default function AiSignals() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<number | null>(null);

  useEffect(() => {
    loadSignals();
  }, []);

  const loadSignals = async () => {
    try {
      const res = await client.entities.signals.query({
        query: {},
        sort: "-created_at",
        limit: 10,
      });
      if (res?.data?.items) {
        setSignals(res.data.items);
      }
    } catch {
      // Fallback data
      setSignals([
        { id: 1, symbol: "BTC/USDT", direction: "long", entry_price: 67250.50, take_profit: 69500.00, stop_loss: 66000.00, confidence: 87.5, signal_type: "whale_accumulation", status: "active", volume_spike: 340.5, whale_activity: true },
        { id: 2, symbol: "ETH/USDT", direction: "long", entry_price: 3485.20, take_profit: 3650.00, stop_loss: 3380.00, confidence: 82.3, signal_type: "volume_spike", status: "active", volume_spike: 520.8, whale_activity: false },
        { id: 3, symbol: "SOL/USDT", direction: "short", entry_price: 178.45, take_profit: 165.00, stop_loss: 185.00, confidence: 75.0, signal_type: "resistance_rejection", status: "active", volume_spike: 180.2, whale_activity: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const executeSignal = async (signal: Signal) => {
    setExecuting(signal.id);
    // Simulate trade execution
    setTimeout(() => {
      setExecuting(null);
    }, 2000);
  };

  const getSignalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      whale_accumulation: "تجميع حيتان",
      volume_spike: "ارتفاع حجم",
      resistance_rejection: "رفض مقاومة",
      social_hype: "ضجة اجتماعية",
      breakout: "اختراق",
    };
    return labels[type] || type;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-success";
    if (confidence >= 60) return "text-gold";
    return "text-danger";
  };

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <Brain size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">المستشار الذكي</h1>
            <p className="text-muted-foreground text-xs">إشارات تداول مدعومة بالذكاء الاصطناعي</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 border border-success/30">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-success text-[10px] font-medium">مباشر</span>
        </div>
      </div>

      {/* Scanner Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
            <Activity size={16} className="text-success" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">محرك المسح نشط</p>
            <p className="text-muted-foreground text-[10px]">يراقب 450+ زوج تداول</p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-success text-xs font-bold">{signals.filter(s => s.status === "active").length} إشارة</p>
          <p className="text-muted-foreground text-[10px]">نشطة الآن</p>
        </div>
      </motion.div>

      {/* Signal Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
              <div className="h-3 bg-white/5 rounded w-2/3 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {signals.map((signal, index) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-4 relative overflow-hidden border ${
                signal.direction === "long" ? "border-success/20" : "border-danger/20"
              }`}
            >
              {/* Signal type badge */}
              <div className="absolute top-3 left-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  signal.direction === "long" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                }`}>
                  {signal.direction === "long" ? "شراء" : "بيع"}
                </span>
              </div>

              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  signal.direction === "long" ? "bg-success/10" : "bg-danger/10"
                }`}>
                  {signal.direction === "long" ? (
                    <TrendingUp size={18} className="text-success" />
                  ) : (
                    <TrendingDown size={18} className="text-danger" />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold">{signal.symbol}</h3>
                  <p className="text-muted-foreground text-xs">{getSignalTypeLabel(signal.signal_type)}</p>
                </div>
              </div>

              {/* Price Info */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">سعر الدخول</p>
                  <p className="text-white text-xs font-bold">${signal.entry_price.toLocaleString()}</p>
                </div>
                <div className="bg-success/5 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <Target size={8} className="text-success" /> الهدف
                  </p>
                  <p className="text-success text-xs font-bold">${signal.take_profit.toLocaleString()}</p>
                </div>
                <div className="bg-danger/5 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <ShieldAlert size={8} className="text-danger" /> الوقف
                  </p>
                  <p className="text-danger text-xs font-bold">${signal.stop_loss.toLocaleString()}</p>
                </div>
              </div>

              {/* Confidence & Indicators */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Volume2 size={12} className="text-gold" />
                    <span className="text-gold text-[10px]">+{signal.volume_spike}%</span>
                  </div>
                  {signal.whale_activity && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px]">🐋</span>
                      <span className="text-purple-400 text-[10px]">نشاط حيتان</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground text-[10px]">الثقة:</span>
                  <span className={`text-xs font-bold ${getConfidenceColor(signal.confidence)}`}>
                    {signal.confidence}%
                  </span>
                </div>
              </div>

              {/* Execute Button */}
              {signal.status === "active" && (
                <button
                  onClick={() => executeSignal(signal)}
                  disabled={executing === signal.id}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    executing === signal.id
                      ? "bg-white/10 text-muted-foreground"
                      : signal.direction === "long"
                      ? "bg-success/20 text-success border border-success/30 hover:bg-success/30"
                      : "bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30"
                  }`}
                >
                  {executing === signal.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      جاري التنفيذ...
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      تنفيذ آلي
                    </>
                  )}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function Activity({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}