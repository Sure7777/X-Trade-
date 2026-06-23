import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Shield,
  Zap,
} from "lucide-react";
import { client } from "@/lib/client";

interface DashboardProps {
  userName?: string;
  isDemo?: boolean;
}

export default function Dashboard({ userName = "محمد أحمد حزام", isDemo = false }: DashboardProps) {
  const [wallet, setWallet] = useState<any>(null);
  const [stats, setStats] = useState({
    totalBalance: 12580.45,
    availableBalance: 8250.30,
    tradingBalance: 3200.15,
    profitToday: 456.78,
    profitPercent: 3.63,
    openTrades: 4,
    winRate: 78.5,
    totalTrades: 156,
  });

  useEffect(() => {
    if (!isDemo) {
      loadWallet();
    }
  }, [isDemo]);

  const loadWallet = async () => {
    try {
      const res = await client.entities.wallets.query({ query: {} });
      if (res?.data?.items?.length > 0) {
        const w = res.data.items[0];
        setWallet(w);
        setStats({
          totalBalance: (w.available_balance || 0) + (w.trading_balance || 0) + (w.vault_balance || 0),
          availableBalance: w.available_balance || 0,
          tradingBalance: w.trading_balance || 0,
          profitToday: w.total_profit || 0,
          profitPercent: w.total_profit && w.total_profit > 0 ? ((w.total_profit / (w.totalBalance || 1)) * 100) : 0,
          openTrades: 4,
          winRate: 78.5,
          totalTrades: 156,
        });
      }
    } catch {
      // Use default stats
    }
  };

  const recentSignals = [
    { symbol: "BTC/USDT", direction: "شراء", change: "+2.4%", isUp: true },
    { symbol: "ETH/USDT", direction: "شراء", change: "+1.8%", isUp: true },
    { symbol: "SOL/USDT", direction: "بيع", change: "-0.9%", isUp: false },
  ];

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">مرحباً، {userName?.split(" ")[0]}</h1>
          <p className="text-muted-foreground text-sm">لوحة التحكم الرئيسية</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-success text-xs font-medium">متصل</span>
        </div>
      </div>

      {/* Main Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-strong p-6 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-success/5 to-transparent" />
        <div className="relative z-10">
          <p className="text-muted-foreground text-sm mb-1">الرصيد الإجمالي</p>
          <h2 className="text-3xl font-black text-white mb-1">
            ${stats.totalBalance.toLocaleString()}
          </h2>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-success" />
            <span className="text-success text-sm font-medium">
              +${stats.profitToday} ({stats.profitPercent.toFixed(1)}%) اليوم
            </span>
          </div>
        </div>
        <div className="absolute top-4 left-4 w-20 h-20 bg-success/10 rounded-full blur-xl" />
      </motion.div>

      {/* Balance Breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">متاح</p>
          <p className="text-sm font-bold text-white">${stats.availableBalance.toLocaleString()}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">قيد التداول</p>
          <p className="text-sm font-bold text-gold">${stats.tradingBalance.toLocaleString()}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">القبو</p>
          <p className="text-sm font-bold text-success">$1,130.00</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gold/15 to-transparent" />
          <div className="relative z-10">
            <Activity size={18} className="text-gold mb-2" />
            <p className="text-xs text-muted-foreground">الصفقات المفتوحة</p>
            <p className="text-lg font-bold text-gold">{stats.openTrades}</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent" />
          <div className="relative z-10">
            <Shield size={18} className="text-success mb-2" />
            <p className="text-xs text-muted-foreground">نسبة الفوز</p>
            <p className="text-lg font-bold text-success">{stats.winRate}%</p>
          </div>
        </motion.div>
      </div>

      {/* Recent Signals */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Zap size={16} className="text-gold" />
            آخر الإشارات
          </h3>
        </div>
        <div className="space-y-2">
          {recentSignals.map((signal, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${signal.isUp ? "bg-success/20" : "bg-danger/20"}`}>
                  {signal.isUp ? (
                    <TrendingUp size={14} className="text-success" />
                  ) : (
                    <TrendingDown size={14} className="text-danger" />
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{signal.symbol}</p>
                  <p className="text-muted-foreground text-xs">{signal.direction}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${signal.isUp ? "text-success" : "text-danger"}`}>
                {signal.change}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-white/20 text-[10px]">
          Created by: Muhammad Ahmad Hizam | 2026 Edition
        </p>
      </div>
    </div>
  );
}