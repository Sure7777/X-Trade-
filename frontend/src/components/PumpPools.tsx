import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Fish, Users, Timer, TrendingUp, Coins } from "lucide-react";
import { client } from "@/lib/client";

interface Pool {
  id: number;
  name: string;
  symbol: string;
  target_amount: number;
  current_amount: number;
  participants_count: number;
  launch_time: string;
  status: string;
  expected_profit_pct: number;
}

export default function PumpPools() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      const res = await client.entities.pump_pools.query({
        query: {},
        sort: "-created_at",
      });
      if (res?.data?.items) {
        setPools(res.data.items);
      }
    } catch {
      setPools([
        { id: 1, name: "صندوق البيتكوين الذهبي", symbol: "BTC/USDT", target_amount: 50000, current_amount: 38500, participants_count: 127, launch_time: "2026-06-25T14:00:00Z", status: "collecting", expected_profit_pct: 15.5 },
        { id: 2, name: "صندوق الإيثريوم الفضي", symbol: "ETH/USDT", target_amount: 25000, current_amount: 22100, participants_count: 89, launch_time: "2026-06-23T18:00:00Z", status: "collecting", expected_profit_pct: 22.0 },
        { id: 3, name: "صندوق سولانا السريع", symbol: "SOL/USDT", target_amount: 15000, current_amount: 15000, participants_count: 56, launch_time: "2026-06-22T20:00:00Z", status: "launched", expected_profit_pct: 35.0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercent = (pool: Pool) => {
    return Math.min((pool.current_amount / pool.target_amount) * 100, 100);
  };

  const getTimeRemaining = (launchTime: string) => {
    const diff = new Date(launchTime).getTime() - Date.now();
    if (diff <= 0) return "انطلق!";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}س ${minutes}د`;
  };

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-amber-500/20 flex items-center justify-center">
            <Fish size={20} className="text-gold" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">صندوق الحيتان</h1>
            <p className="text-muted-foreground text-xs">صفقات تشاركية مستقبلية</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-5 border border-gold/20 bg-gradient-to-l from-gold/5 to-transparent"
      >
        <p className="text-gold text-xs font-medium mb-1">💰 كيف يعمل صندوق الحيتان؟</p>
        <p className="text-muted-foreground text-[10px] leading-relaxed">
          يتم تجميع السيولة من المشاركين لتنفيذ صفقات كبيرة بشكل جماعي. عند اكتمال الهدف ينطلق الصندوق تلقائياً.
        </p>
      </motion.div>

      {/* Pool Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/2 mb-3" />
              <div className="h-20 bg-white/5 rounded mb-3" />
              <div className="h-3 bg-white/5 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {pools.map((pool, index) => {
            const progress = getProgressPercent(pool);
            const isLaunched = pool.status === "launched";

            return (
              <motion.div
                key={pool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card p-4 relative overflow-hidden border ${
                  isLaunched ? "border-success/30" : "border-gold/20"
                }`}
              >
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isLaunched ? "bg-success/10 text-success" : "bg-gold/10 text-gold"
                  }`}>
                    {isLaunched ? "🚀 انطلق" : "⏳ جاري التجميع"}
                  </span>
                </div>

                {/* Pool Name & Symbol */}
                <div className="mb-4">
                  <h3 className="text-white font-bold text-sm">{pool.name}</h3>
                  <p className="text-muted-foreground text-xs">{pool.symbol}</p>
                </div>

                {/* Progress Ring */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32" cy="32" r="28"
                        stroke="rgba(255,215,0,0.1)"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="32" cy="32" r="28"
                        stroke={isLaunched ? "#00ff88" : "#ffd700"}
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${progress * 1.76} 176`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                        style={{
                          filter: `drop-shadow(0 0 6px ${isLaunched ? "rgba(0,255,136,0.5)" : "rgba(255,215,0,0.5)"})`,
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-xs font-bold ${isLaunched ? "text-success" : "text-gold"}`}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground text-[10px]">السيولة المجمعة</span>
                      <span className="text-white text-xs font-bold">
                        ${pool.current_amount.toLocaleString()} / ${pool.target_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground text-[10px] flex items-center gap-1">
                        <Users size={10} /> المشاركون
                      </span>
                      <span className="text-white text-xs">{pool.participants_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[10px] flex items-center gap-1">
                        <TrendingUp size={10} /> الربح المتوقع
                      </span>
                      <span className="text-success text-xs font-bold">+{pool.expected_profit_pct}%</span>
                    </div>
                  </div>
                </div>

                {/* Timer & Join */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer size={14} className="text-gold" />
                    <span className="text-gold text-xs font-medium">
                      {getTimeRemaining(pool.launch_time)}
                    </span>
                  </div>
                  {!isLaunched && (
                    <button className="px-4 py-2 bg-gold/20 text-gold border border-gold/30 rounded-xl text-xs font-bold hover:bg-gold/30 transition-all">
                      <Coins size={12} className="inline ml-1" />
                      انضم الآن
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}