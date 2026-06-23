import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Brain,
  TrendingUp,
  Wallet,
  Fish,
  Clock,
} from "lucide-react";

interface BottomNavProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
}

const tabs = [
  { icon: LayoutDashboard, label: "الرئيسية" },
  { icon: Brain, label: "المستشار" },
  { icon: TrendingUp, label: "التداول" },
  { icon: Wallet, label: "المحفظة" },
  { icon: Fish, label: "الحيتان" },
  { icon: Clock, label: "السجل" },
];

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-card-strong border-t border-white/10 rounded-t-3xl px-2 py-2 mx-0">
        <div className="flex items-center justify-around">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === index;
            return (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className="relative flex flex-col items-center py-2 px-3 rounded-2xl transition-all"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-success/10 rounded-2xl border border-success/30"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon
                  size={20}
                  className={`relative z-10 transition-colors ${
                    isActive ? "text-success" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`relative z-10 text-[10px] mt-1 font-medium transition-colors ${
                    isActive ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}