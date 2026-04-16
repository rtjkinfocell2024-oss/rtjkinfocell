import { Zap, Wrench, Users, Menu } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const navItems = [
    { id: 'venda-rapida', label: 'Venda Rápida', icon: Zap },
    { id: 'os', label: 'O.S.', icon: Wrench },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'menu', label: 'Menu', icon: Menu },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 bg-slate-950/90 backdrop-blur-md border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.4)] rounded-t-3xl transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-2xl transition-all duration-300 relative",
                isActive ? "text-success" : "text-slate-400 hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-success/10 rounded-2xl -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="flex flex-col items-center"
              >
                <Icon size={22} className={cn("transition-transform duration-300", isActive && "scale-110")} />
                <span className="text-[10px] font-bold uppercase tracking-tighter truncate w-full text-center">
                  {item.label}
                </span>
              </motion.div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
