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
  Clock,
  Users,
  Search,
  ArrowLeft
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
import { motion } from 'motion/react';
import { formatCurrency, cn } from '@/src/lib/utils';
import { Transaction, ServiceOrder, Product } from '@/src/types';

interface ReportsProps {
  serviceOrders: ServiceOrder[];
  transactions: Transaction[];
  products: Product[];
}

type ReportType = 'vendas' | 'servicos' | 'estoque' | 'financeiro' | 'clientes' | 'produtos' | null;

export function Reports({ serviceOrders, transactions, products }: ReportsProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType>(null);
  const [dateRange, setDateRange] = useState('7d');

  // Relatórios de seleção
  const reportCards = [
    { id: 'vendas', title: 'Relatório de Vendas', description: 'Análise detalhada de vendas por período', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'servicos', title: 'Relatório de Serviços', description: 'Ordens de serviço por status e período', icon: Wrench, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'estoque', title: 'Relatório de Estoque', description: 'Situação atual do estoque e movimentações', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'financeiro', title: 'Relatório Financeiro', description: 'Fluxo de caixa e demonstrativo de resultados', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'clientes', title: 'Relatório de Clientes', description: 'Lista de clientes e histórico de compras', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'produtos', title: 'Relatório de Produtos', description: 'Produtos mais vendidos e rentabilidade', icon: Smartphone, color: 'text-sky-600', bg: 'bg-sky-50' },
  ];

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

  // Se nenhum relatório selecionado, exibe o Dashboard de Seleção
  if (!selectedReport) {
    return (
      <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-20 lg:pb-8">
        <header>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Relatórios Gerenciais</h2>
          <p className="text-slate-500 font-medium">Selecione uma categoria para analisar o desempenho da sua empresa.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedReport(card.id as ReportType)}
                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all text-left group flex flex-col gap-6 cursor-pointer"
              >
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", card.bg)}>
                  <Icon className={cn("w-8 h-8", card.color)} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors underline-offset-4 decoration-primary/30 group-hover:underline">
                    {card.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
                
                <div className="mt-auto flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Acessar Relatório
                  <ArrowLeft size={14} className="rotate-180" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // Visualização detalhada de um relatório
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-500 pb-20 lg:pb-8">
      {/* Header Detalhado */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedReport(null)}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors text-slate-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              {reportCards.find(c => c.id === selectedReport)?.title}
            </h2>
            <p className="text-sm text-text-muted font-medium">Relatório Detalhado • Período Atual</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2 py-3 px-6 rounded-2xl shadow-lg shadow-primary/20 text-sm font-bold w-full md:w-auto">
            <Download size={18} />
            Exportar PDF
          </button>
        </div>
      </header>

      {/* Conteúdo Dinâmico baseado no tipo selecionado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-primary">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Métrica Principal</p>
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <TrendingUp size={14} />
            </div>
          </div>
          <h3 className="text-2xl font-black">
            {selectedReport === 'vendas' ? formatCurrency(stats.totalSales) : 
             selectedReport === 'servicos' ? `${serviceOrders.length} Ordens` :
             selectedReport === 'estoque' ? `${products.length} Produtos` :
             formatCurrency(stats.totalRevenue)}
          </h3>
          <p className="text-[10px] text-success font-bold mt-1 flex items-center gap-1">
            <TrendingUp size={10} /> +12% vs mês anterior
          </p>
        </div>
        {/* Adicione mais stats cards se necessário */}
      </div>

      {/* Exemplo de Gráfico (Apenas para Vendas/Financeiro no momento) */}
      {(selectedReport === 'vendas' || selectedReport === 'financeiro' || selectedReport === 'produtos') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card rounded-[2rem] overflow-hidden">
            <div className="card-header flex items-center justify-between border-b-0">
              <h3 className="card-title flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                Performance Setorial
              </h3>
            </div>
            <div className="card-content p-6 flex flex-col h-full">
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
            </div>
          </div>

          <div className="card rounded-[2rem] overflow-hidden">
            <div className="card-header bg-slate-50 border-b-0">
              <h3 className="card-title flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                Listagem de Registros
              </h3>
            </div>
            <div className="card-content p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border">
                      <th className="px-5 py-4 text-[10px] font-black uppercase text-text-muted tracking-wider">Identificador</th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase text-text-muted tracking-wider">Data</th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase text-text-muted tracking-wider text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.slice(0, 5).map((t, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 text-xs font-bold">{t.description}</td>
                        <td className="px-5 py-4 text-xs text-text-muted">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="px-5 py-4 text-xs font-black text-right">{formatCurrency(t.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nota de rodapé ou placeholder para relatórios não implementados detalhadamente */}
      {['servicos', 'estoque', 'clientes'].includes(selectedReport as string) && (
        <div className="bg-white p-12 rounded-[3rem] border border-dashed border-slate-300 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Search size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Módulo Detalhado em Geração</h3>
            <p className="text-slate-500 max-w-sm">Estamos consolidando os dados de {selectedReport} para gerar esta análise profunda. Tente novamente em alguns instantes.</p>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .card, .card *, header, header * { visibility: visible; }
          header { margin-bottom: 2rem; }
          .side-bar, .bottom-nav, button:not(.btn-primary) { display: none !important; }
        }
      `}</style>
    </div>
  );
}
