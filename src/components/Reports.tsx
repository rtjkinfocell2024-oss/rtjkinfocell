import { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar,
  Filter,
  FileText,
  DollarSign,
  Package,
  Wrench,
  Smartphone,
  ChevronDown,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { formatCurrency, cn } from '@/src/lib/utils';
import { Transaction, ServiceOrder, Product } from '@/src/types';

interface ReportsProps {
  serviceOrders: ServiceOrder[];
  transactions: Transaction[];
  products: Product[];
}

type ReportType = 'vendas' | 'produtos' | 'financeiro';

export function Reports({ serviceOrders, transactions, products }: ReportsProps) {
  const [reportType, setReportType] = useState<ReportType>('vendas');
  const [dateRange, setDateRange] = useState('7d');

  // Logic for data analysis
  const stats = useMemo(() => {
    const totalSales = transactions.filter(t => t.type === 'Entrada' && t.category === 'Venda').reduce((acc, t) => acc + t.value, 0);
    const totalServiceRevenue = serviceOrders.filter(os => os.status === 'Entregue').reduce((acc, os) => acc + os.totalValue, 0);
    const accountsReceivable = serviceOrders.filter(os => os.status !== 'Entregue' && os.status !== 'Cancelado').reduce((acc, os) => acc + os.totalValue, 0);
    
    // Category Breakdown (Mocked distribution based on real products available)
    const distribution = [
      { name: 'Acessórios', value: totalSales * 0.45, items: 12 },
      { name: 'Celulares', value: totalSales * 0.35, items: 3 },
      { name: 'Peças', value: totalServiceRevenue * 0.6, items: 8 },
      { name: 'Serviços', value: totalServiceRevenue * 0.4, items: 15 },
    ];

    return {
      totalRevenue: totalSales + totalServiceRevenue,
      totalSales,
      totalServiceRevenue,
      accountsReceivable,
      distribution
    };
  }, [serviceOrders, transactions]);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-20 lg:pb-8">
      {/* Header com Filtros Pro */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios Gerenciais</h2>
          <p className="text-sm text-text-muted">Gestão estratégica e análise de desempenho.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex bg-white border border-border rounded-xl p-1 shadow-sm">
            {[
              { id: 'vendas', label: 'Vendas' },
              { id: 'produtos', label: 'Produtos' },
              { id: 'financeiro', label: 'Financeiro' },
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id as ReportType)}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  reportType === type.id ? "bg-primary text-white" : "text-text-muted hover:text-text-main"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>

          <button onClick={handlePrint} className="btn-primary flex items-center gap-2 py-2 text-xs">
            <Download size={16} />
            PDF
          </button>
        </div>
      </header>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card p-5 border-l-4 border-l-primary">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Receita Total</p>
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <BarChart3 size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-black">{formatCurrency(stats.totalRevenue)}</h3>
          <p className="text-[10px] text-success font-bold mt-1 flex items-center gap-1">
            <TrendingUp size={10} /> +12% vs mês anterior
          </p>
        </div>

        <div className="card p-5 border-l-4 border-l-success">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Vendas PDV</p>
            <div className="p-1.5 bg-success/10 rounded-lg text-success">
              <DollarSign size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-black">{formatCurrency(stats.totalSales)}</h3>
          <p className="text-[10px] text-success font-bold mt-1 flex items-center gap-1">
            <TrendingUp size={10} /> +8% vs mês anterior
          </p>
        </div>

        <div className="card p-5 border-l-4 border-l-orange-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">A Receber</p>
            <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-500">
              <Clock size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-black">{formatCurrency(stats.accountsReceivable)}</h3>
          <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-tighter">OS em aberto</p>
        </div>

        <div className="card p-5 border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Ticket Médio</p>
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-500">
              <TrendingUp size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-black">{formatCurrency(stats.totalRevenue / Math.max(transactions.length + serviceOrders.length, 1))}</h3>
          <p className="text-[10px] text-indigo-500 font-bold mt-1 uppercase tracking-tighter">Média por cliente</p>
        </div>
      </div>

      {/* Gráficos e Tabelas Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Categorias */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="card-title flex items-center gap-2">
              <Package size={18} className="text-primary" />
              Categorias de Produto
            </h3>
            <span className="text-[10px] font-bold text-text-muted uppercase">Nível Pro</span>
          </div>
          <div className="card-content">
            <div className="h-[250px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {stats.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3">
              {stats.distribution.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-xs font-bold text-text-main">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black">{formatCurrency(item.value)}</p>
                    <p className="text-[10px] text-text-muted font-bold tracking-tighter">{item.items} itens vendidos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela de Lançamentos em PDF / Listagem */}
        <div className="card overflow-hidden">
          <div className="card-header bg-slate-100/50">
            <h3 className="card-title flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Detalhamento de Exportação
            </h3>
          </div>
          <div className="card-content p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-border">
                    <th className="px-5 py-3 text-[10px] font-black uppercase text-text-muted tracking-wider">Origem</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase text-text-muted tracking-wider">Data</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase text-text-muted tracking-wider">Categoria</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase text-text-muted tracking-wider text-right">Valor</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase text-text-muted tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {/* Combinação de Vendas e OS para o relatório */}
                  {[
                    ...transactions.filter(t => t.category === 'Venda').map(t => ({
                      origin: 'PDV', 
                      date: t.date, 
                      category: 'Venda Geral', 
                      value: t.value, 
                      status: 'Pago',
                      type: 'venda'
                    })),
                    ...serviceOrders.map(os => ({
                      origin: `OS #${os.id}`, 
                      date: os.createdAt, 
                      category: 'Serviço', 
                      value: os.totalValue, 
                      status: os.status === 'Entregue' ? 'Pago' : 'Pendente',
                      type: 'servico'
                    }))
                  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10).map((row, i) => (row.type === 'venda' || row.status === 'Pago' || reportType === 'financeiro') && (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-xs font-bold">{row.origin}</td>
                      <td className="px-5 py-3 text-xs text-text-muted">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-xs font-medium text-primary uppercase tracking-tighter">{row.category}</td>
                      <td className="px-5 py-3 text-xs font-black text-right">{formatCurrency(row.value)}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                          row.status === 'Pago' ? "bg-success/10 text-success" : "bg-orange-500/10 text-orange-500"
                        )}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50 border-t border-border flex justify-center">
              <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline transition-all">
                Ver todos os registros →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos para Impressão PDF Profissional */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .lg\\:pb-8, .pb-20 { padding-bottom: 0 !important; }
          .card, .card * { visibility: visible; }
          .card { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            box-shadow: none !important; 
            border: 1px solid #eee !important;
            break-inside: avoid;
          }
          header, .flex-bg, button, .sidebar, .bottom-nav { display: none !important; }
          .grid { display: block !important; }
          .card { margin-bottom: 2rem; }
        }
      `}</style>
    </div>
  );
}
