import { useState, useEffect, FormEvent } from 'react';
import { X, Save, Printer, Smartphone, User, AlertCircle, Calendar, Clock, DollarSign, FileText, ChevronDown } from 'lucide-react';
import { cn, formatCurrency } from '@/src/lib/utils';
import { ServiceOrder, OSStatus, Customer, OSPriority, PaymentMachine, Transaction } from '@/src/types';

interface OSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (os: ServiceOrder) => void;
  os?: ServiceOrder | null;
  mode: 'create' | 'edit' | 'view';
  customers: Customer[];
  machines: PaymentMachine[];
  onSaveTransaction: (tx: Transaction) => void;
}

const statusOptions: OSStatus[] = ['Pendente', 'Orçamento', 'Aguardando Peça', 'Em Manutenção', 'Pronto', 'Entregue', 'Cancelado'];
const priorityOptions: OSPriority[] = ['Baixa', 'Normal', 'Alta', 'Urgente'];

export function OSModal({ isOpen, onClose, onSave, os, mode, customers, machines, onSaveTransaction }: OSModalProps) {
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

  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [selectedMachineId, setSelectedMachineId] = useState(machines[0]?.id || '');
  const [installments, setInstallments] = useState(1);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);

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

    const isDelivering = formData.status === 'Entregue' && os?.status !== 'Entregue';
    
    if (isDelivering && !showPaymentSelector) {
      setShowPaymentSelector(true);
      return;
    }

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

    // Sync with finance if delivered
    if (isDelivering) {
      const selectedMachine = machines.find(m => m.id === selectedMachineId);
      let feePercentage = 0;
      if (paymentMethod === 'PIX') feePercentage = selectedMachine?.pixFee || 0;
      else if (paymentMethod === 'Débito') feePercentage = selectedMachine?.debitFee || 0;
      else if (paymentMethod === 'Crédito') feePercentage = selectedMachine?.creditFees[installments] || 0;

      const totalValue = formData.totalValue || 0;
      const machineFee = totalValue * (feePercentage / 100);
      const netValue = totalValue - machineFee;

      const paymentInfo = paymentMethod === 'Crédito' ? ` (${installments}x)` : '';
      
      const newTransaction: Transaction = {
        id: Math.floor(Math.random() * 10000).toString(),
        type: 'Entrada',
        category: 'Serviço',
        description: `OS #${newOS.id} Finalizada: ${newOS.device} - ${newOS.customerName}${paymentInfo}`,
        value: netValue,
        date: new Date().toISOString(),
        machineId: selectedMachineId,
        installments: paymentMethod === 'Crédito' ? installments : 1
      };

      onSaveTransaction(newTransaction);
    }

    onClose();
    setShowPaymentSelector(false);
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

            {/* Modal de Pagamento (Condicional) */}
            {showPaymentSelector && (
              <div className="md:col-span-2 bg-primary/5 p-6 rounded-2xl border-2 border-primary/20 space-y-4 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-primary">
                  <DollarSign size={20} />
                  <h4 className="font-bold">Finalizar Pagamento da OS</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <p className="label text-[10px]">Forma de Pagamento</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['PIX', 'Dinheiro', 'Débito', 'Crédito'].map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            setPaymentMethod(method);
                            if (method !== 'Crédito') setInstallments(1);
                          }}
                          className={cn(
                            "py-2 px-3 rounded-xl text-[11px] font-bold border transition-all",
                            paymentMethod === method 
                              ? "bg-primary text-white border-primary shadow-sm" 
                              : "bg-white text-text-muted border-border hover:bg-slate-50"
                          )}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(['PIX', 'Débito', 'Crédito'].includes(paymentMethod)) && (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="label text-[10px]">Maquininha</label>
                        <div className="relative">
                          <select 
                            className="input text-xs py-1.5 pr-8 bg-white"
                            value={selectedMachineId}
                            onChange={(e) => setSelectedMachineId(e.target.value)}
                          >
                            {machines.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        </div>
                      </div>

                      {paymentMethod === 'Crédito' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="label text-[10px]">Parcelamento</label>
                          <div className="relative">
                            <select 
                              className="input text-xs py-1.5 pr-8 bg-white font-bold"
                              value={installments}
                              onChange={(e) => setInstallments(Number(e.target.value))}
                            >
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(i => (
                                <option key={i} value={i}>{i}x de {formatCurrency((formData.totalValue || 0) / i)}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-primary/10 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-xs font-bold text-primary">Valor à Receber:</span>
                  <span className="text-lg font-black text-primary">{formatCurrency(formData.totalValue || 0)}</span>
                </div>
              </div>
            )}
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
