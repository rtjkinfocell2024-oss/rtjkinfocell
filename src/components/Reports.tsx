import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar,
  PieChart as PieChartIcon
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
  Cell
} from 'recharts';
import { formatCurrency } from '@/src/lib/utils';

const salesData = [
  { name: 'Jan', value: 12000 },
  { name: 'Fev', value: 15000 },
  { name: 'Mar', value: 18000 },
  { name: 'Abr', value: 14500 },
];

const categoryData = [
  { name: 'Acessórios', value: 4500 },
  { name: 'Serviços', value: 8000 },
  { name: 'Peças', value: 2000 },
];

const COLORS = ['#2563eb', '#10b981', '#f59e0b'];

export function Reports() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-sm text-text-muted">Análise detalhada de vendas, serviços e desempenho.</p>
        </div>
        
        <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2">
          <Download size={18} />
          Gerar PDF
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card p-5">
          <p className="label">Ticket Médio</p>
          <h3 className="text-2xl font-bold">{formatCurrency(185.50)}</h3>
          <div className="flex items-center gap-1 text-xs text-success mt-2">
            <TrendingUp size={12} />
            <span>+4.2% vs mês anterior</span>
          </div>
        </div>
        <div className="card p-5">
          <p className="label">Conversão de Orçamentos</p>
          <h3 className="text-2xl font-bold">72%</h3>
          <div className="flex items-center gap-1 text-xs text-success mt-2">
            <TrendingUp size={12} />
            <span>+2.1% vs mês anterior</span>
          </div>
        </div>
        <div className="card p-5">
          <p className="label">Tempo Médio de Reparo</p>
          <h3 className="text-2xl font-bold">4.2h</h3>
          <div className="flex items-center gap-1 text-xs text-danger mt-2">
            <TrendingDown size={12} />
            <span>+0.5h vs mês anterior</span>
          </div>
        </div>
        <div className="card p-5">
          <p className="label">Taxa de Retorno (Garantia)</p>
          <h3 className="text-2xl font-bold">1.5%</h3>
          <div className="flex items-center gap-1 text-xs text-success mt-2">
            <TrendingDown size={12} />
            <span>-0.3% vs mês anterior</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <BarChart3 size={18} />
              Faturamento Mensal
            </h3>
          </div>
          <div className="card-content h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `R$ ${v/1000}k`} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <PieChartIcon size={18} />
              Distribuição por Categoria
            </h3>
          </div>
          <div className="card-content h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 pr-8">
              {categoryData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-text-muted ml-auto">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
