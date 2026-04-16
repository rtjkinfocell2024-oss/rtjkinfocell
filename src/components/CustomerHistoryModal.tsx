import { X, Calendar, DollarSign, Package, Wrench, ChevronRight } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/src/lib/utils';
import { Customer, ServiceOrder, Transaction } from '@/src/types';

interface CustomerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  serviceOrders: ServiceOrder[];
  transactions: Transaction[];
}

export function CustomerHistoryModal({ 
  isOpen, 
  onClose, 
  customer, 
  serviceOrders, 
  transactions 
}: CustomerHistoryModalProps) {
  if (!isOpen || !customer) return null;

  // Filter and combine history
  const customerOS = serviceOrders.filter(os => os.customerId === customer.id);
  const customerSales = transactions.filter(t => t.customerId === customer.id);

  const history = [
    ...customerOS.map(os => ({
      id: os.id,
      date: os.createdAt,
      type: 'OS',
      title: os.device,
      subtitle: os.problem,
      value: os.totalValue,
      status: os.status,
    })),
    ...customerSales.map(sale => ({
      id: sale.id,
      date: sale.date,
      type: 'Compra',
      title: 'Venda Rápida',
      subtitle: sale.description.replace('Venda PDV: ', '').split(' - Cliente:')[0],
      value: sale.value,
      status: 'Pago',
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        <header className="px-6 py-5 border-b border-border flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
              {customer.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">{customer.name}</h3>
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Histórico de Movimentações</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted opacity-50">
              <Calendar size={48} strokeWidth={1} className="mb-4" />
              <p className="font-bold">Nenhum registro encontrado</p>
              <p className="text-xs">O cliente ainda não possui compras ou OS.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, idx) => (
                <div 
                  key={`${item.type}-${item.id}`} 
                  className="group relative flex items-start gap-4 p-4 rounded-2xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div className={cn(
                    "mt-1 p-2 rounded-xl shrink-0 transition-colors",
                    item.type === 'OS' ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {item.type === 'OS' ? <Wrench size={18} /> : <Package size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                          item.type === 'OS' ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {item.type}
                        </span>
                        <span className="text-[10px] text-text-muted font-bold italic">
                          {formatDate(item.date)}
                        </span>
                      </div>
                      <p className="text-sm font-black text-text-main">{formatCurrency(item.value)}</p>
                    </div>
                    
                    <h4 className="font-bold text-text-main truncate">{item.title}</h4>
                    <p className="text-xs text-text-muted line-clamp-2 mt-0.5 leading-relaxed tracking-tight">
                      {item.subtitle}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded",
                        item.status === 'Entregue' || item.status === 'Pago' 
                          ? "bg-success/10 text-success" 
                          : item.status === 'Cancelado' 
                          ? "bg-danger/10 text-danger"
                          : "bg-warning/10 text-warning"
                      )}>
                        {item.status}
                      </span>
                      
                      <button className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver Detalhes <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="px-6 py-4 bg-slate-50 border-t border-border flex justify-between items-center">
            <div className="flex gap-4">
                <div className="text-center">
                   <p className="text-[10px] font-bold text-text-muted uppercase">Total Investido</p>
                   <p className="text-sm font-black text-primary">{formatCurrency(history.reduce((acc, i) => acc + i.value, 0))}</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                   <p className="text-[10px] font-bold text-text-muted uppercase">Interações</p>
                   <p className="text-sm font-black text-text-main">{history.length}</p>
                </div>
            </div>
            <button onClick={onClose} className="btn-secondary px-8">Fechar</button>
        </footer>
      </div>
    </div>
  );
}
