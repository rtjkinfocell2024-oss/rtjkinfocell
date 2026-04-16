import { 
  LayoutDashboard, 
  Wrench, 
  Zap, 
  Package, 
  Users, 
  DollarSign, 
  BarChart3, 
  Settings,
  X
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface MobileFullMenuProps {
  onSelect: (tab: string) => void;
  onClose: () => void;
}

export function MobileFullMenu({ onSelect, onClose }: MobileFullMenuProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'os', label: 'Ordem de Serviço', icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'venda-rapida', label: 'Venda Rápida', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { id: 'estoque', label: 'Estoque / Produtos', icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'clientes', label: 'Clientes', icon: Users, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, color: 'text-slate-500', bg: 'bg-slate-50' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Menu Principal</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="flex flex-col items-center justify-center p-6 bg-white border border-border rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 text-center gap-3"
            >
              <div className={cn("p-3 rounded-xl", item.bg, item.color)}>
                <Icon size={24} />
              </div>
              <span className="text-sm font-bold text-text-main leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
