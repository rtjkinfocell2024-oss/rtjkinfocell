import { useState, useEffect } from 'react';
import { Search, Package, User, Clock, CheckCircle2, AlertCircle, Phone, ArrowLeft, Smartphone, XCircle } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/src/lib/utils';
import { ServiceOrder, OSStatus, Customer } from '@/src/types';

interface OSCustomerConsultationProps {
  serviceOrders: ServiceOrder[];
  customers: Customer[];
  initialSearch?: string;
}

export function OSCustomerConsultation({ serviceOrders, customers, initialSearch = '' }: OSCustomerConsultationProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [result, setResult] = useState<ServiceOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (term: string) => {
    if (!term.trim()) return;

    // Normalize search term (remove special chars for phone check)
    const cleanTerm = term.replace(/\D/g, '');
    
    // 1. Search by OS ID
    let os = serviceOrders.find(o => 
      o.id === term.replace('#', '') || 
      o.id === term
    );

    // 2. If not found, search by Phone in customers
    if (!os && cleanTerm.length >= 8) {
      const customer = customers.find(c => c.phone.replace(/\D/g, '').includes(cleanTerm));
      if (customer) {
        // Find most recent OS for this customer
        os = serviceOrders
          .filter(o => o.customerId === customer.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      }
    }

    if (os) {
      setResult(os);
      setError(null);
    } else {
      setResult(null);
      setError('Ordem de Serviço não encontrada. Verifique o código ou telefone.');
    }
  };

  useEffect(() => {
    if (initialSearch) {
      handleSearch(initialSearch);
    }
  }, [initialSearch]);

  const getStatusInfo = (status: OSStatus) => {
    switch (status) {
      case 'Pronto': return { icon: <CheckCircle2 className="text-emerald-500" />, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' };
      case 'Em Manutenção': return { icon: <Clock className="text-blue-500" />, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' };
      case 'Aguardando Peça': return { icon: <Package className="text-orange-500" />, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100' };
      case 'Cancelado': return { icon: <XCircle className="text-red-500" />, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' };
      default: return { icon: <AlertCircle className="text-slate-500" />, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-100' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-md flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white mb-4 shadow-lg shadow-primary/20">
            <Smartphone size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Acompanhar Reparo</h1>
          <p className="text-slate-500 text-sm">Consulte o status da sua Ordem de Serviço em tempo real.</p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
            Nº da OS ou Telefone
          </label>
          <div className="relative group">
            <input 
              type="text"
              placeholder="Ex: 8922 ou 11999998888"
              className="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          </div>
          <button 
            onClick={() => handleSearch(searchTerm)}
            className="w-full mt-4 h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all"
          >
            Consultar Status
          </button>
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-center gap-2 animate-in fade-in zoom-in duration-300">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        {/* Result Card */}
        {result && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Status Banner */}
            {(() => {
              const status = getStatusInfo(result.status);
              return (
                <div className={cn("p-6 flex items-center justify-between border-b", status.bg, status.border)}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      {status.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Atual</p>
                      <p className={cn("text-lg font-black uppercase", status.color)}>{result.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ordem</p>
                    <p className="text-lg font-mono font-bold text-slate-900">#{result.id}</p>
                  </div>
                </div>
              );
            })()}

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <User size={10} /> Cliente
                  </p>
                  <p className="font-semibold text-slate-900 line-clamp-1">{result.customerName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Smartphone size={10} /> Aparelho
                  </p>
                  <p className="font-semibold text-slate-900 line-clamp-1">{result.device}</p>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={10} /> Previsão de Entrega
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-700">
                      {result.status === 'Pronto' || result.status === 'Entregue' 
                        ? 'Disponível para retirada' 
                        : result.updatedAt 
                          ? `Atualizado em ${formatDate(result.updatedAt)}`
                          : 'Aguardando avaliação'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {result.problem && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <AlertCircle size={10} /> Defeito Relatado
                  </p>
                  <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl italic border-l-4 border-slate-200">
                    "{result.problem}"
                  </p>
                </div>
              )}

              {result.totalValue > 0 && (result.status === 'Pronto' || result.status === 'Entregue') && (
                <div className="pt-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-400">Total a pagar</p>
                  <p className="text-2xl font-black text-primary">{formatCurrency(result.totalValue)}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-tight">
                Em caso de dúvidas, entre em contato via WhatsApp.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

