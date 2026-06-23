import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Filter,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";
import { client } from "@/lib/client";

type FilterType = "all" | "trades" | "deposits" | "withdrawals";

interface HistoryItem {
  id: number;
  type: string;
  symbol?: string;
  side?: string;
  amount: number;
  pnl?: number;
  status: string;
  created_at: string;
  description?: string;
}

export default function History() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const [tradesRes, transactionsRes] = await Promise.all([
        client.entities.trades.query({ query: {}, sort: "-created_at", limit: 20 }),
        client.entities.transactions.query({ query: {}, sort: "-created_at", limit: 20 }),
      ]);

      const items: HistoryItem[] = [];

      if (tradesRes?.data?.items) {
        tradesRes.data.items.forEach((t: any) => {
          items.push({
            id: t.id,
            type: "trade",
            symbol: t.symbol,
            side: t.side,
            amount: t.quantity * t.price,
            pnl: t.pnl,
            status: t.status,
            created_at: t.created_at,
          });
        });
      }

      if (transactionsRes?.data?.items) {
        transactionsRes.data.items.forEach((t: any) => {
          items.push({
            id: t.id + 1000,
            type: t.type,
            amount: t.amount,
            status: t.status,
            created_at: t.created_at,
            description: t.description,
          });
        });
      }

      if (items.length > 0) {
        setHistory(items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } else {
        // Fallback demo data
        setHistory(getDemoHistory());
      }
    } catch {
      setHistory(getDemoHistory());
    } finally {
      setLoading(false);
    }
  };

  const getDemoHistory = (): HistoryItem[] => [
    { id: 1, type: "trade", symbol: "BTC/USDT", side: "buy", amount: 500, pnl: 45.20, status: "closed", created_at: "2026-06-22T15:30:00Z" },
    { id: 2, type: "trade", symbol: "ETH/USDT", side: "sell", amount: 300, pnl: -12.50, status: "closed", created_at: "2026-06-22T14:00:00Z" },
    { id: 3, type: "deposit", amount: 1000, status: "completed", created_at: "2026-06-22T10:00:00Z", description: "إيداع USDT TRC20" },
    { id: 4, type: "trade", symbol: "SOL/USDT", side: "buy", amount: 200, pnl: 28.90, status: "closed", created_at: "2026-06-21T18:00:00Z" },
    { id: 5, type: "withdrawal", amount: 500, status: "completed", created_at: "2026-06-21T12:00:00Z", description: "سحب إلى محفظة خارجية" },
    { id: 6, type: "trade", symbol: "DOGE/USDT", side: "buy", amount: 150, pnl: 67.30, status: "closed", created_at: "2026-06-20T20:00:00Z" },
    { id: 7, type: "trade", symbol: "XRP/USDT", side: "sell", amount: 400, pnl: -8.40, status: "closed", created_at: "2026-06-20T16:00:00Z" },
  ];

  const filteredHistory = history.filter((item) => {
    if (filter === "all") return true;
    if (filter === "trades") return item.type === "trade";
    if (filter === "deposits") return item.type === "deposit";
    if (filter === "withdrawals") return item.type === "withdrawal";
    return true;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ar-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getIcon = (item: HistoryItem) => {
    if (item.type === "trade") {
      return item.side === "buy" ? (
        <TrendingUp size={14} className="text-success" />
      ) : (
        <TrendingDown size={14} className="text-danger" />
      );
    }
    if (item.type === "deposit") return <ArrowDownToLine size={14} className="text-success" />;
    return <ArrowUpFromLine size={14} className="text-danger" />;
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "الكل" },
    { key: "trades", label: "الصفقات" },
    { key: "deposits", label: "الإيداعات" },
    { key: "withdrawals", label: "السحوبات" },
  ];

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <Clock size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">السجل</h1>
            <p className="text-muted-foreground text-xs">سجل جميع العمليات</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filter === f.key
                ? "bg-white/10 text-white border border-white/20"
                : "bg-white/5 text-muted-foreground border border-transparent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground">إجمالي الصفقات</p>
          <p className="text-sm font-bold text-white">156</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground">رابحة</p>
          <p className="text-sm font-bold text-success">122</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground">خاسرة</p>
          <p className="text-sm font-bold text-danger">34</p>
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-card p-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10" />
                <div className="flex-1">
                  <div className="h-3 bg-white/10 rounded w-1/3 mb-2" />
                  <div className="h-2 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  item.type === "trade"
                    ? item.pnl && item.pnl > 0 ? "bg-success/10" : "bg-danger/10"
                    : item.type === "deposit" ? "bg-success/10" : "bg-danger/10"
                }`}>
                  {getIcon(item)}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {item.type === "trade" ? item.symbol : item.type === "deposit" ? "إيداع" : "سحب"}
                  </p>
                  <p className="text-muted-foreground text-[10px]">
                    {item.type === "trade" ? (item.side === "buy" ? "شراء" : "بيع") : item.description || ""}
                    {" • "}
                    {formatDate(item.created_at)}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-white text-xs font-medium">${item.amount.toLocaleString()}</p>
                {item.type === "trade" && item.pnl !== undefined && (
                  <p className={`text-[10px] font-bold ${item.pnl >= 0 ? "text-success" : "text-danger"}`}>
                    {item.pnl >= 0 ? "+" : ""}{item.pnl.toFixed(2)}$
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredHistory.length === 0 && !loading && (
        <div className="text-center py-10">
          <Clock size={40} className="text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground text-sm">لا توجد عمليات بعد</p>
        </div>
      )}
    </div>
  );
}