import { 
  TrendingUp, 
  Wrench, 
  DollarSign, 
  Users,
  Search,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, cn } from '@/src/lib/utils';
import { ServiceOrder } from '@/src/types';

interface DashboardProps {
  serviceOrders: ServiceOrder[];
  setActiveTab: (tab: string) => void;
}

const data = [
  { name: 'Seg', vendas: 2400, os: 1200 },
  { name: 'Ter', vendas: 1398, os: 900 },
  { name: 'Qua', vendas: 9800, os: 2400 },
  { name: 'Qui', vendas: 3908, os: 1800 },
  { name: 'Sex', vendas: 4800, os: 2100 },
  { name: 'Sab', vendas: 3800, os: 1500 },
  { name: 'Dom', vendas: 4300, os: 1200 },
];

export function Dashboard({ serviceOrders, setActiveTab }: DashboardProps) {
  const stats = [
    { label: 'Vendas Hoje', value: 2450.00, icon: TrendingUp, trend: '+12%', trendUp: true },
    { label: 'OS em Aberto', value: serviceOrders.filter(os => os.status !== 'Entregue' && os.status !== 'Cancelado').length, icon: Wrench, trend: '-2', trendUp: false },
    { label: 'Líquido Mensal', value: 18920.45, icon: DollarSign, trend: '+8.2%', trendUp: true },
    { label: 'Novos Clientes', value: 32, icon: Users, trend: '+5', trendUp: true },
  ];
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Geral</h2>
          <p className="text-sm text-text-muted">Bem-vindo de volta, Ricardo.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input 
            type="text" 
            placeholder="Buscar cliente, OS ou produto..." 
            className="input pl-10 w-[300px]"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="card p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary/5 rounded-lg text-primary">
                <stat.icon size={20} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                stat.trendUp ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
              )}>
                {stat.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <p className="label">{stat.label}</p>
            <h3 className="text-2xl font-bold">
              {typeof stat.value === 'number' && stat.label.includes('R$') || stat.label.includes('Líquido') || stat.label.includes('Vendas')
                ? formatCurrency(stat.value) 
                : stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h3 className="card-title">Desempenho Semanal</h3>
            <select className="text-xs font-medium border-none bg-transparent focus:ring-0 cursor-pointer">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="card-content h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="vendas" fill="#2563eb" radius={[4, 4, 0, 0]} name="Vendas" />
                <Bar dataKey="os" fill="#10b981" radius={[4, 4, 0, 0]} name="Serviços" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Status de OS</h3>
          </div>
          <div className="card-content flex flex-col gap-4">
            {[
              { label: 'Aguardando Peça', count: 5, color: 'bg-warning' },
              { label: 'Em Manutenção', count: 3, color: 'bg-primary' },
              { label: 'Pronto para Entrega', count: 4, color: 'bg-success' },
              { label: 'Orçamentos', count: 2, color: 'bg-text-muted' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", item.color)}></div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className="text-sm font-bold">{item.count}</span>
              </div>
            ))}
            
            <div className="mt-4 pt-4 border-t border-border">
              <button 
                onClick={() => setActiveTab('os')}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                Ver todas as OS
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Ordens de Serviço Recentes</h3>
          <button 
            onClick={() => setActiveTab('os')}
            className="text-xs font-bold text-primary hover:underline"
          >
            Ver todas
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-text-muted font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Nº OS</th>
                <th className="px-5 py-3">Equipamento</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {serviceOrders.slice(0, 5).map((os, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-5 py-3 font-bold text-primary">#{os.id}</td>
                  <td className="px-5 py-3 font-medium">{os.device}</td>
                  <td className="px-5 py-3 text-text-muted">{os.customerName}</td>
                  <td className="px-5 py-3">
                    <span className={cn(
                      "badge",
                      os.status === 'Pronto' ? "badge-success" : 
                      os.status === 'Aguardando Peça' ? "badge-warning" : "badge-info"
                    )}>
                      {os.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold">{formatCurrency(os.totalValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
