import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Lock,
  Shield,
  RefreshCw,
} from "lucide-react";

export default function WalletVault() {
  const [activeSection, setActiveSection] = useState<"overview" | "deposit" | "withdraw">("overview");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");

  const walletData = {
    totalBalance: 12580.45,
    availableBalance: 8250.30,
    tradingBalance: 3200.15,
    vaultBalance: 1130.00,
    profitToday: 456.78,
    profitWeek: 1234.56,
    profitMonth: 3456.78,
  };

  const depositAddresses = [
    { network: "USDT (TRC20)", address: "TXyz...abc123def456" },
    { network: "USDT (BEP20)", address: "0x1a2b...3c4d5e6f" },
  ];

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success/20 to-gold/20 flex items-center justify-center">
            <Wallet size={20} className="text-success" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">المحفظة والقبو</h1>
            <p className="text-muted-foreground text-xs">إدارة أموالك بأمان</p>
          </div>
        </div>
      </div>

      {/* Total Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-strong p-6 mb-5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-success/5 via-transparent to-gold/5" />
        <div className="relative z-10">
          <p className="text-muted-foreground text-sm mb-1">الرصيد الإجمالي</p>
          <h2 className="text-3xl font-black text-white mb-3">
            ${walletData.totalBalance.toLocaleString()}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground">متاح</p>
              <p className="text-sm font-bold text-white">${walletData.availableBalance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">قيد التداول</p>
              <p className="text-sm font-bold text-gold">${walletData.tradingBalance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">القبو</p>
              <p className="text-sm font-bold text-success">${walletData.vaultBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <button
          onClick={() => setActiveSection("deposit")}
          className={`glass-card p-3 flex flex-col items-center gap-2 transition-all ${
            activeSection === "deposit" ? "border-success/50 glow-green" : ""
          }`}
        >
          <ArrowDownToLine size={18} className="text-success" />
          <span className="text-xs text-white font-medium">إيداع</span>
        </button>
        <button
          onClick={() => setActiveSection("withdraw")}
          className={`glass-card p-3 flex flex-col items-center gap-2 transition-all ${
            activeSection === "withdraw" ? "border-danger/50 glow-red" : ""
          }`}
        >
          <ArrowUpFromLine size={18} className="text-danger" />
          <span className="text-xs text-white font-medium">سحب</span>
        </button>
        <button
          onClick={() => setActiveSection("overview")}
          className={`glass-card p-3 flex flex-col items-center gap-2 transition-all ${
            activeSection === "overview" ? "border-gold/50 glow-gold" : ""
          }`}
        >
          <Lock size={18} className="text-gold" />
          <span className="text-xs text-white font-medium">القبو</span>
        </button>
      </div>

      {/* Sections */}
      <AnimatePresence mode="wait">
        {activeSection === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Vault Section */}
            <div className="glass-card p-4 mb-4 border border-gold/20">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} className="text-gold" />
                <h3 className="text-white font-bold text-sm">قبو الأرباح الآمن</h3>
              </div>
              <p className="text-muted-foreground text-xs mb-3">
                يتم ترحيل الأرباح الصافية تلقائياً إلى القبو لحمايتها
              </p>
              <div className="bg-gold/5 rounded-xl p-3 border border-gold/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-xs">رصيد القبو</span>
                  <span className="text-gold font-bold">${walletData.vaultBalance.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-l from-gold to-gold/60 rounded-full" style={{ width: "45%" }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">45% من الهدف الشهري</p>
              </div>
            </div>

            {/* Profit Summary */}
            <div className="glass-card p-4">
              <h3 className="text-white font-bold text-sm mb-3">ملخص الأرباح</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">أرباح اليوم</span>
                  <span className="text-success font-bold text-sm">+${walletData.profitToday}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">أرباح الأسبوع</span>
                  <span className="text-success font-bold text-sm">+${walletData.profitWeek.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">أرباح الشهر</span>
                  <span className="text-success font-bold text-sm">+${walletData.profitMonth.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === "deposit" && (
          <motion.div
            key="deposit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="glass-card p-4">
              <h3 className="text-white font-bold text-sm mb-4">إيداع USDT</h3>
              {depositAddresses.map((addr, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-3 mb-3 border border-white/10">
                  <p className="text-success text-xs font-medium mb-1">{addr.network}</p>
                  <p className="text-white text-xs font-mono break-all">{addr.address}</p>
                  <button className="mt-2 text-[10px] text-gold hover:text-gold/80 transition-colors">
                    نسخ العنوان
                  </button>
                </div>
              ))}
              <div className="mt-4 p-3 bg-gold/5 rounded-xl border border-gold/20">
                <p className="text-gold text-xs font-medium mb-1">⚠️ تنبيه أمان</p>
                <p className="text-muted-foreground text-[10px]">
                  تأكد من إرسال USDT فقط على الشبكة الصحيحة. أي إرسال خاطئ قد يؤدي لفقدان الأموال.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === "withdraw" && (
          <motion.div
            key="withdraw"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="glass-card p-4">
              <h3 className="text-white font-bold text-sm mb-4">سحب الأموال</h3>
              <div className="mb-3">
                <label className="text-muted-foreground text-xs mb-1 block">عنوان المحفظة</label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder="أدخل عنوان المحفظة..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-danger/50"
                />
              </div>
              <div className="mb-4">
                <label className="text-muted-foreground text-xs mb-1 block">المبلغ (USDT)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-danger/50"
                />
                <p className="text-muted-foreground text-[10px] mt-1">
                  الرصيد المتاح: ${walletData.availableBalance.toLocaleString()}
                </p>
              </div>
              <button className="w-full py-3 bg-danger/20 text-danger border border-danger/30 rounded-xl font-bold text-sm hover:bg-danger/30 transition-all">
                تأكيد السحب
              </button>
              <div className="mt-3 p-3 bg-danger/5 rounded-xl border border-danger/20">
                <p className="text-danger text-xs font-medium mb-1">🔒 أمان مزدوج</p>
                <p className="text-muted-foreground text-[10px]">
                  سيتم إرسال رمز تأكيد عبر تليجرام قبل تنفيذ عملية السحب
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

