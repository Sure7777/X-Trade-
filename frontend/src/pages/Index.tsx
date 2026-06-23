import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { client } from "@/lib/client";
import WelcomeScreen from "@/components/WelcomeScreen";
import Dashboard from "@/components/Dashboard";
import AiSignals from "@/components/AiSignals";
import TradingView from "@/components/TradingView";
import WalletVault from "@/components/WalletVault";
import PumpPools from "@/components/PumpPools";
import History from "@/components/History";
import BottomNav from "@/components/BottomNav";

// Telegram WebApp SDK type declaration
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (fn: () => void) => void;
        };
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        colorScheme: string;
        themeParams: Record<string, string>;
        isExpanded: boolean;
      };
    };
  }
}

export default function Index() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [telegramUser, setTelegramUser] = useState<any>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Initialize Telegram WebApp SDK if available
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Get Telegram user data
      if (tg.initDataUnsafe?.user) {
        setTelegramUser(tg.initDataUnsafe.user);
      }
    }

    // Try Atoms Cloud auth
    try {
      const res = await client.auth.me();
      if (res?.data) {
        setUser(res.data);
        setShowWelcome(false);
      }
    } catch {
      // Not logged in via Atoms Cloud - check Telegram
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        // Auto-login for Telegram users
        setTelegramUser(window.Telegram.WebApp.initDataUnsafe.user);
        setShowWelcome(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    try {
      client.auth.toLogin();
    } catch {
      // Fallback if auth not available
    }
  };

  const handleDemoMode = () => {
    setIsDemoMode(true);
    setShowWelcome(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-navy flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-success border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (showWelcome && !user && !isDemoMode && !telegramUser) {
    return (
      <WelcomeScreen
        onLogin={handleLogin}
        onDemo={handleDemoMode}
        telegramUser={telegramUser}
      />
    );
  }

  const displayName = telegramUser
    ? `${telegramUser.first_name}${telegramUser.last_name ? " " + telegramUser.last_name : ""}`
    : user?.name || user?.email || "محمد أحمد حزام";

  const tabs = [
    <Dashboard key="dashboard" userName={displayName} isDemo={isDemoMode} />,
    <AiSignals key="signals" />,
    <TradingView key="trading" />,
    <WalletVault key="wallet" />,
    <PumpPools key="pools" />,
    <History key="history" />,
  ];

  return (
    <div className="min-h-screen gradient-navy pb-20">
      {isDemoMode && (
        <div className="bg-gold/10 text-gold text-center text-xs py-1.5 font-medium border-b border-gold/20">
          ⚠️ وضع تجريبي - البيانات وهمية للتوضيح فقط
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tabs[activeTab]}
        </motion.div>
      </AnimatePresence>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}