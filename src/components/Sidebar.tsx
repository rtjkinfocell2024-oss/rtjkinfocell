import { 
  LayoutDashboard, 
  Wrench, 
  Zap, 
  Package, 
  Users, 
  DollarSign, 
  BarChart3, 
  CreditCard, 
  Settings 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'os', label: 'Ordem de Serviço', icon: Wrench },
  { id: 'venda-rapida', label: 'Venda Rápida', icon: Zap },
  { id: 'estoque', label: 'Estoque / Produtos', icon: Package },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="hidden lg:flex w-[240px] bg-white border-r border-border flex-col py-6 h-screen sticky top-0 transition-all">
      <div className="px-6 mb-8">
        <h1 className="text-xl font-extrabold text-primary tracking-tight uppercase">RTJK INFOCELL</h1>
      </div>
      
      <nav className="flex-1">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-all cursor-pointer",
                    isActive 
                      ? "bg-slate-50 text-primary border-r-4 border-primary" 
                      : "text-text-muted hover:bg-slate-50 hover:text-text-main"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="px-6 mt-auto pt-6 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            RI
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate">RTJK INFOCELL</p>
            <p className="text-[10px] text-text-muted truncate">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
