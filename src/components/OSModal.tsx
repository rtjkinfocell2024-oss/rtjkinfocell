import { useState, useEffect, FormEvent } from 'react';
import { X, Save, Printer, Smartphone, User, AlertCircle } from 'lucide-react';
import { cn, formatCurrency } from '@/src/lib/utils';
import { ServiceOrder, OSStatus } from '@/src/types';

interface OSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (os: ServiceOrder) => void;
  os?: ServiceOrder | null;
  mode: 'create' | 'edit' | 'view';
}

const statusOptions: OSStatus[] = ['Orçamento', 'Aguardando Peça', 'Em Manutenção', 'Pronto', 'Entregue', 'Cancelado'];

export function OSModal({ isOpen, onClose, onSave, os, mode }: OSModalProps) {
  const [formData, setFormData] = useState<Partial<ServiceOrder>>({
    customerName: '',
    device: '',
    problem: '',
    status: 'Orçamento',
    totalValue: 0,
  });

  useEffect(() => {
    if (os) {
      setFormData(os);
    } else {
      setFormData({
        customerName: '',
        device: '',
        problem: '',
        status: 'Orçamento',
        totalValue: 0,
      });
    }
  }, [os, isOpen]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isView) return;

    const newOS: ServiceOrder = {
      id: os?.id || Math.floor(Math.random() * 10000).toString(),
      customerId: os?.customerId || '1',
      customerName: formData.customerName || '',
      device: formData.device || '',
      problem: formData.problem || '',
      status: formData.status as OSStatus || 'Orçamento',
      totalValue: formData.totalValue || 0,
      createdAt: os?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newOS);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="label">Cliente</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="text" 
                  className="input pl-10" 
                  placeholder="Nome do cliente"
                  required
                  disabled={isView}
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label">Equipamento</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="text" 
                  className="input pl-10" 
                  placeholder="Ex: iPhone 13 Pro"
                  required
                  disabled={isView}
                  value={formData.device}
                  onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label">Problema Relatado</label>
            <textarea 
              className="input min-h-[100px]" 
              placeholder="Descreva o defeito..."
              required
              disabled={isView}
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="label">Status</label>
              <select 
                className="input"
                disabled={isView}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as OSStatus })}
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label">Valor Total (R$)</label>
              <input 
                type="number" 
                className="input" 
                placeholder="0,00"
                required
                disabled={isView}
                value={formData.totalValue}
                onChange={(e) => setFormData({ ...formData, totalValue: Number(e.target.value) })}
              />
            </div>
          </div>

          {isView && (
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
          )}
        </form>

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
