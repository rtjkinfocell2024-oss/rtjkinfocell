import { useState, useEffect, FormEvent } from 'react';
import { X, Save, Printer, Smartphone, User, AlertCircle, Calendar, Clock, DollarSign, FileText } from 'lucide-react';
import { cn, formatCurrency } from '@/src/lib/utils';
import { ServiceOrder, OSStatus, Customer, OSPriority } from '@/src/types';

interface OSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (os: ServiceOrder) => void;
  os?: ServiceOrder | null;
  mode: 'create' | 'edit' | 'view';
  customers: Customer[];
}

const statusOptions: OSStatus[] = ['Pendente', 'Orçamento', 'Aguardando Peça', 'Em Manutenção', 'Pronto', 'Entregue', 'Cancelado'];
const priorityOptions: OSPriority[] = ['Baixa', 'Normal', 'Alta', 'Urgente'];

export function OSModal({ isOpen, onClose, onSave, os, mode, customers }: OSModalProps) {
  const [formData, setFormData] = useState<Partial<ServiceOrder>>({
    customerId: '',
    customerName: '',
    device: '',
    problem: '',
    status: 'Pendente',
    priority: 'Normal',
    totalValue: 0,
    entryDate: new Date().toISOString().split('T')[0],
    deliveryForecast: '',
    technicalNotes: '',
  });

  useEffect(() => {
    if (os) {
      setFormData(os);
    } else {
      setFormData({
        customerId: '',
        customerName: '',
        device: '',
        problem: '',
        status: 'Pendente',
        priority: 'Normal',
        totalValue: 0,
        entryDate: new Date().toISOString().split('T')[0],
        deliveryForecast: '',
        technicalNotes: '',
      });
    }
  }, [os, isOpen]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData({
        ...formData,
        customerId: customer.id,
        customerName: customer.name
      });
    } else {
      setFormData({
        ...formData,
        customerId: '',
        customerName: ''
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isView) return;

    const newOS: ServiceOrder = {
      id: os?.id || Math.floor(Math.random() * 10000).toString(),
      customerId: formData.customerId || '',
      customerName: formData.customerName || '',
      device: formData.device || '',
      problem: formData.problem || '',
      status: formData.status as OSStatus || 'Pendente',
      priority: formData.priority as OSPriority || 'Normal',
      totalValue: formData.totalValue || 0,
      entryDate: formData.entryDate || new Date().toISOString().split('T')[0],
      deliveryForecast: formData.deliveryForecast || '',
      technicalNotes: formData.technicalNotes || '',
      createdAt: os?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newOS);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
        <header className="px-6 py-4 border-b border-border flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold">
              {mode === 'create' ? 'Nova Ordem de Serviço' : mode === 'edit' ? `Editar OS #${os?.id}` : `Visualizar OS #${os?.id}`}
            </h3>
            <p className="text-xs text-text-muted">Preencha os dados do cliente e do equipamento.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cliente */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="label">Cliente *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <select 
                  className="input pl-10"
                  required
                  disabled={isView}
                  value={formData.customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                >
                  <option value="">Selecione o cliente...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Equipamento */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="label">Equipamento *</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="text" 
                  className="input pl-10" 
                  placeholder="Ex: iPhone 12 Pro, Samsung Galaxy S21"
                  required
                  disabled={isView}
                  value={formData.device}
                  onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                />
              </div>
            </div>

            {/* Defeito Relatado */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="label">Defeito Relatado *</label>
              <textarea 
                className="input min-h-[80px] py-2" 
                placeholder="Descreva o defeito relatado pelo cliente..."
                required
                disabled={isView}
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Status *</label>
              <select 
                className="input"
                required
                disabled={isView}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as OSStatus })}
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Prioridade */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Prioridade *</label>
              <select 
                className="input"
                required
                disabled={isView}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as OSPriority })}
              >
                {priorityOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Data de Entrada */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Data de Entrada</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="date" 
                  className="input pl-10" 
                  disabled={isView}
                  value={formData.entryDate}
                  onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                />
              </div>
            </div>

            {/* Previsão de Entrega */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Previsão de Entrega</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="date" 
                  className="input pl-10" 
                  disabled={isView}
                  value={formData.deliveryForecast}
                  onChange={(e) => setFormData({ ...formData, deliveryForecast: e.target.value })}
                />
              </div>
            </div>

            {/* Valor Total */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Valor Total</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="number" 
                  className="input pl-10" 
                  placeholder="0,00"
                  disabled={isView}
                  value={formData.totalValue}
                  onChange={(e) => setFormData({ ...formData, totalValue: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Observações Técnicas */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="label">Observações Técnicas</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-text-muted" size={16} />
                <textarea 
                  className="input min-h-[100px] pl-10 py-2" 
                  placeholder="Notas internas, peças utilizadas, detalhes técnicos..."
                  disabled={isView}
                  value={formData.technicalNotes}
                  onChange={(e) => setFormData({ ...formData, technicalNotes: e.target.value })}
                />
              </div>
            </div>
          </div>
        </form>

        {isView && (
          <div className="px-6 pb-6">
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Data de Entrada:</span>
                <span className="font-medium">{new Date(os?.createdAt || '').toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Última Atualização:</span>
                <span className="font-medium">{new Date(os?.updatedAt || '').toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <footer className="px-6 py-4 border-t border-border flex justify-between items-center bg-slate-50">
          <button 
            type="button"
            className="btn-secondary flex items-center gap-2"
            onClick={() => window.print()}
          >
            <Printer size={18} />
            Imprimir Recibo
          </button>
          
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            {!isView && (
              <button type="submit" onClick={handleSubmit} className="btn-primary flex items-center gap-2">
                <Save size={18} />
                Salvar OS
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
