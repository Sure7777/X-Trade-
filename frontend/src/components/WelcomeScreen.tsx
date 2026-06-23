import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onLogin: () => void;
  onDemo: () => void;
  telegramUser: any;
}

export default function WelcomeScreen({ onLogin, onDemo, telegramUser }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen gradient-navy flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-success/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative z-10 mb-8"
      >
        <div className="w-28 h-28 rounded-3xl glass-card-strong flex items-center justify-center glow-green relative">
          <span className="text-5xl font-black neon-green">X</span>
          <div className="absolute inset-0 rounded-3xl border border-success/30 animate-spin-slow" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-4xl font-black text-white mb-2 relative z-10"
      >
        X-<span className="neon-green">Trader</span>
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-muted-foreground text-lg mb-3 relative z-10"
      >
        منظومة التداول الذكي المتقدمة
      </motion.p>

      {/* User name */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="glass-card px-6 py-3 mb-8 relative z-10"
      >
        <p className="text-white/80 text-sm">مرحباً بك</p>
        <p className="text-white font-bold text-lg">
          {telegramUser
            ? `${telegramUser.first_name}${telegramUser.last_name ? " " + telegramUser.last_name : ""}`
            : "محمد أحمد حزام"}
        </p>
      </motion.div>

      {/* Login button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onLogin}
        className="relative z-10 w-full max-w-xs px-8 py-4 bg-gradient-to-l from-success/90 to-success rounded-2xl text-navy font-bold text-lg glow-green transition-all hover:shadow-[0_0_30px_rgba(0,255,136,0.5)] mb-3"
      >
        تسجيل الدخول عبر تليجرام
      </motion.button>

      {/* Demo mode button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDemo}
        className="relative z-10 w-full max-w-xs px-8 py-3 bg-white/5 border border-white/20 rounded-2xl text-white/70 font-medium text-sm transition-all hover:bg-white/10 hover:text-white"
      >
        🎮 تجربة الوضع التجريبي
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="relative z-10 text-muted-foreground text-[10px] mt-3 text-center"
      >
        الوضع التجريبي يستخدم بيانات وهمية للتوضيح فقط
      </motion.p>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-6 text-center relative z-10"
      >
        <p className="text-white/30 text-xs">
          Created by: Muhammad Ahmad Hizam | 2026 Edition
        </p>
      </motion.div>
    </div>
  );
}