import { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/src/lib/utils';
import { ServiceOrder, OSStatus, Customer, PaymentMachine, Transaction } from '@/src/types';
import { OSModal } from './OSModal';

interface ServiceOrdersProps {
  serviceOrders: ServiceOrder[];
  onSaveOS: (os: ServiceOrder) => void;
  customers: Customer[];
  machines: PaymentMachine[];
  onSaveTransaction: (tx: Transaction) => void;
}

export function ServiceOrders({ serviceOrders, onSaveOS, customers, machines, onSaveTransaction }: ServiceOrdersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);

  const getStatusBadge = (status: OSStatus) => {
    switch (status) {
      case 'Pronto': return 'badge-success';
      case 'Aguardando Peça': return 'badge-warning';
      case 'Em Manutenção': return 'badge-info';
      case 'Orçamento': return 'badge-info';
      case 'Entregue': return 'bg-slate-100 text-slate-600';
      case 'Cancelado': return 'badge-danger';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', os?: ServiceOrder) => {
    setModalMode(mode);
    setSelectedOS(os || null);
    setIsModalOpen(true);
  };

  const filteredOS = serviceOrders.filter(os => 
    os.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.id.includes(searchTerm)
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ordens de Serviço</h2>
          <p className="text-sm text-text-muted">Gerencie todos os reparos e manutenções.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal('create')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Nova OS
        </button>
      </header>

      <div className="card">
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por Nº OS, cliente ou aparelho..." 
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="btn-secondary flex items-center gap-2 flex-1 md:flex-none">
              <Filter size={16} />
              Filtros
            </button>
            <select className="input w-full md:w-[150px]">
              <option>Todos Status</option>
              <option>Orçamento</option>
              <option>Em Manutenção</option>
              <option>Pronto</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-text-muted font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Nº OS</th>
                <th className="px-5 py-3">Data</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Equipamento</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Valor</th>
                <th className="px-5 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOS.map((os) => (
                <tr key={os.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-primary">#{os.id}</td>
                  <td className="px-5 py-4 text-text-muted">{formatDate(os.createdAt)}</td>
                  <td className="px-5 py-4 font-medium">{os.customerName}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{os.device}</span>
                      <span className="text-[11px] text-text-muted truncate max-w-[200px]">{os.problem}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn("badge", getStatusBadge(os.status))}>
                      {os.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-bold">{formatCurrency(os.totalValue)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenModal('view', os)}
                        className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded-md transition-colors" 
                        title="Ver Detalhes"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal('edit', os)}
                        className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded-md transition-colors" 
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/5 rounded-md transition-colors" title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOS.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-text-muted">
                    Nenhuma ordem de serviço encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-border flex justify-between items-center text-sm text-text-muted">
          <span>Mostrando {filteredOS.length} de {serviceOrders.length} resultados</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-border rounded hover:bg-slate-50 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-slate-50">Próxima</button>
          </div>
        </div>
      </div>

      <OSModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={onSaveOS}
        os={selectedOS}
        mode={modalMode}
        customers={customers}
        machines={machines}
        onSaveTransaction={onSaveTransaction}
      />
    </div>
  );
}
