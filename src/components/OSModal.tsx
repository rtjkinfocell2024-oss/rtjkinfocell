import { useState, useEffect, FormEvent } from 'react';
import { X, Save, Printer, Smartphone, User, AlertCircle, Calendar, Clock, DollarSign, FileText, ChevronDown, Share2 } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/src/lib/utils';
import { toast } from 'sonner';
import { ServiceOrder, OSStatus, Customer, OSPriority, PaymentMachine, Transaction, OSType, StoreSettings } from '@/src/types';

interface OSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (os: ServiceOrder) => void;
  os?: ServiceOrder | null;
  mode: 'create' | 'edit' | 'view';
  customers: Customer[];
  machines: PaymentMachine[];
  onSaveTransaction: (tx: Transaction) => void;
  serviceOrders: ServiceOrder[];
  storeSettings: StoreSettings;
}

const statusOptions: OSStatus[] = ['Pendente', 'Orçamento', 'Aguardando Peça', 'Em Manutenção', 'Pronto', 'Entregue', 'Cancelado'];
const priorityOptions: OSPriority[] = ['Normal', 'Urgente', 'Muito Urgente'];
const typeOptions: OSType[] = ['Nova', 'Retorno'];

export function OSModal({ isOpen, onClose, onSave, os, mode, customers, machines, onSaveTransaction, serviceOrders, storeSettings }: OSModalProps) {
  const [formData, setFormData] = useState<Partial<ServiceOrder>>({
    customerId: '',
    customerName: '',
    device: '',
    model: '',
    imei: '',
    imei2: '',
    sn: '',
    color: '',
    storage: '',
    ram: '',
    problem: '',
    status: 'Pendente',
    priority: 'Normal',
    type: 'Nova',
    totalValue: 0,
    entryDate: new Date().toISOString().split('T')[0],
    deliveryForecast: '',
    technicalNotes: '',
    returnReason: '',
    originalOsId: '',
    items: [],
  });

  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [selectedMachineId, setSelectedMachineId] = useState(machines[0]?.id || '');
  const [installments, setInstallments] = useState(1);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);

  // Novos estados para Pagamento
  const [receivedCash, setReceivedCash] = useState(0);
  const [cashAmount, setCashAmount] = useState(0); // Para Misto
  const [cardAmount, setCardAmount] = useState(0); // Para Misto

  useEffect(() => {
    if (os) {
      setFormData(os);
    } else {
      setFormData({
        customerId: '',
        customerName: '',
        device: '',
        model: '',
        imei: '',
        imei2: '',
        sn: '',
        color: '',
        storage: '',
        ram: '',
        problem: '',
        status: 'Pendente',
        priority: 'Normal',
        totalValue: 0,
        entryDate: new Date().toISOString().split('T')[0],
        deliveryForecast: '',
        technicalNotes: '',
        type: 'Nova',
        returnReason: '',
        originalOsId: '',
        items: [],
      });
    }
  }, [os, isOpen]);

  const selectedOriginalOs = formData.originalOsId 
    ? serviceOrders.find(s => s.id === formData.originalOsId)
    : null;

  const getWarrantyStatus = () => {
    if (!selectedOriginalOs) return null;
    const deliveryDate = new Date(selectedOriginalOs.updatedAt);
    const expiryDate = new Date(deliveryDate);
    expiryDate.setDate(expiryDate.getDate() + 90); // 90 days standard warranty
    const isExpired = expiryDate < new Date();
    
    return {
      expiry: expiryDate.toLocaleDateString('pt-BR'),
      isExpired
    };
  };

  const warranty = getWarrantyStatus();

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
      const isWarranty = formData.type === 'Retorno';
      
      if (isDelivering && !showPaymentSelector && !isWarranty) {
        setShowPaymentSelector(true);
        return;
      }
  
      const newOS: ServiceOrder = {
        id: os?.id || Math.floor(Math.random() * 10000).toString(),
        customerId: formData.customerId || '',
        customerName: formData.customerName || '',
        device: formData.device || '',
        model: formData.model || '',
        imei: formData.imei || '',
        imei2: formData.imei2 || '',
        sn: formData.sn || '',
        color: formData.color || '',
        storage: formData.storage || '',
        ram: formData.ram || '',
        problem: formData.problem || '',
        status: formData.status as OSStatus || 'Pendente',
        priority: formData.priority as OSPriority || 'Normal',
        type: formData.type as OSType || 'Nova',
        originalOsId: formData.originalOsId,
        returnReason: formData.returnReason,
        totalValue: formData.totalValue || 0,
        entryDate: formData.entryDate || new Date().toISOString().split('T')[0],
        deliveryForecast: formData.deliveryForecast || '',
        technicalNotes: formData.technicalNotes || '',
        items: formData.items || [],
        createdAt: os?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
  
      onSave(newOS);
  
      // Sync with finance if delivered and NOT warranty
      if (isDelivering && !isWarranty) {
        const totalValue = formData.totalValue || 0;
        
        if (paymentMethod === 'Misto') {
          // Registro Dinheiro
          if (cashAmount > 0) {
            onSaveTransaction({
              id: `${Math.floor(Math.random() * 10000)}-1`,
              type: 'Entrada',
              category: 'Serviço (Misto - Dinheiro)',
              description: `OS #${newOS.id} Finalizada (Parte Dinheiro): ${newOS.device} - ${newOS.customerName}`,
              value: cashAmount,
              date: new Date().toISOString(),
              customerId: newOS.customerId
            });
          }
          // Registro Cartão
          if (cardAmount > 0) {
            onSaveTransaction({
              id: `${Math.floor(Math.random() * 10000)}-2`,
              type: 'Entrada',
              category: 'Serviço (Misto - Cartão)',
              description: `OS #${newOS.id} Finalizada (Parte Cartão): ${newOS.device} - ${newOS.customerName} (${installments}x)`,
              value: cardAmount,
              date: new Date().toISOString(),
              machineId: selectedMachineId,
              installments: installments,
              customerId: newOS.customerId
            });
          }
        } else {
          const selectedMachine = machines.find(m => m.id === selectedMachineId);
          let feePercentage = 0;
          if (paymentMethod === 'PIX') feePercentage = selectedMachine?.pixFee || 0;
          else if (paymentMethod === 'Débito') feePercentage = selectedMachine?.debitFee || 0;
          else if (paymentMethod === 'Crédito') feePercentage = selectedMachine?.creditFees[installments] || 0;

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
            installments: paymentMethod === 'Crédito' ? installments : 1,
            customerId: newOS.customerId
          };

          onSaveTransaction(newTransaction);
        }
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
            {/* Tipo de OS */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Tipo de OS *</label>
              <div className="grid grid-cols-2 gap-2">
                {typeOptions.map(type => (
                  <button
                    key={type}
                    type="button"
                    disabled={isView || (mode === 'edit' && os?.type === 'Retorno')}
                    onClick={() => setFormData({ ...formData, type })}
                    className={cn(
                      "py-2 px-3 rounded-xl text-xs font-bold border transition-all",
                      formData.type === type 
                        ? "bg-primary text-white border-primary shadow-sm" 
                        : "bg-white text-text-muted border-border hover:bg-slate-50"
                    )}
                  >
                    {type === 'Nova' ? 'Nova Abertura' : 'Retorno / Garantia'}
                  </button>
                ))}
              </div>
            </div>

            {/* Prioridade */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Prioridade *</label>
              <div className="grid grid-cols-3 gap-2">
                {priorityOptions.map(prio => (
                  <button
                    key={prio}
                    type="button"
                    disabled={isView}
                    onClick={() => setFormData({ ...formData, priority: prio })}
                    className={cn(
                      "py-2 px-1 rounded-xl text-[10px] font-bold border transition-all",
                      formData.priority === prio 
                        ? prio === 'Normal' ? "bg-blue-600 text-white border-blue-600" :
                          prio === 'Urgente' ? "bg-orange-500 text-white border-orange-500" :
                          "bg-red-600 text-white border-red-600 shadow-sm"
                        : "bg-white text-text-muted border-border hover:bg-slate-50"
                    )}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>

            {/* Campos de Retorno */}
            {formData.type === 'Retorno' && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-left-4">
                <div className="flex flex-col gap-1.5">
                  <label className="label text-primary font-bold">OS Original *</label>
                  <select 
                    className="input border-primary/30"
                    required
                    disabled={isView}
                    value={formData.originalOsId}
                    onChange={(e) => setFormData({ ...formData, originalOsId: e.target.value })}
                  >
                    <option value="">Selecione a OS anterior...</option>
                    {serviceOrders
                      .filter(s => s.customerId === formData.customerId && s.id !== os?.id)
                      .map(s => (
                        <option key={s.id} value={s.id}>#{s.id} - {s.device} ({formatDate(s.createdAt)})</option>
                      ))
                    }
                  </select>
                </div>
                {warranty && (
                  <div className={cn(
                    "flex flex-col justify-center p-4 rounded-xl border",
                    warranty.isExpired ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
                  )}>
                    <p className="text-[10px] uppercase font-black text-text-muted">Status da Garantia (90 dias)</p>
                    <p className={cn("text-lg font-black", warranty.isExpired ? "text-red-600" : "text-emerald-600")}>
                      {warranty.isExpired ? 'EXPIRADA' : 'VÁLIDA'}
                    </p>
                    <p className="text-xs font-bold text-text-muted">Vencimento: {warranty.expiry}</p>
                  </div>
                )}
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="label">Motivo do Retorno *</label>
                  <textarea 
                    className="input min-h-[60px] py-2 border-primary/20" 
                    placeholder="Descreva o motivo do retorno ou falha na garantia..."
                    required
                    disabled={isView}
                    value={formData.returnReason}
                    onChange={(e) => setFormData({ ...formData, returnReason: e.target.value })}
                  />
                </div>
              </div>
            )}

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

            {/* Equipamento e Detalhes */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-border">
              <div className="md:col-span-3">
                <h4 className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-1.5">Equipamento</h4>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input 
                    type="text" 
                    className="input pl-10" 
                    placeholder="Nome do Aparelho"
                    required
                    disabled={isView}
                    value={formData.device}
                    onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label text-[10px]">Modelo</label>
                <input 
                  type="text" 
                  className="input h-9 text-xs" 
                  disabled={isView}
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label text-[10px]">Cor</label>
                <input 
                  type="text" 
                  className="input h-9 text-xs" 
                  disabled={isView}
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label text-[10px]">Capacidade / RAM</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="GB"
                    className="input h-9 text-xs" 
                    disabled={isView}
                    value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                  />
                  <input 
                    type="text" 
                    placeholder="RAM"
                    className="input h-9 text-xs" 
                    disabled={isView}
                    value={formData.ram}
                    onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label text-[10px]">IMEI 1</label>
                <input 
                  type="text" 
                  className="input h-9 text-xs" 
                  disabled={isView}
                  value={formData.imei}
                  onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label text-[10px]">IMEI 2</label>
                <input 
                  type="text" 
                  className="input h-9 text-xs" 
                  disabled={isView}
                  value={formData.imei2}
                  onChange={(e) => setFormData({ ...formData, imei2: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label text-[10px]">Número de Série (SN)</label>
                <input 
                  type="text" 
                  className="input h-9 text-xs" 
                  disabled={isView}
                  value={formData.sn}
                  onChange={(e) => setFormData({ ...formData, sn: e.target.value })}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <p className="label text-[10px] uppercase font-black text-slate-400">Forma de Pagamento</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['PIX', 'Dinheiro', 'Débito', 'Crédito', 'Misto'].map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            setPaymentMethod(method);
                            if (method !== 'Crédito' && method !== 'Misto') setInstallments(1);
                            if (method === 'Misto') {
                              setCashAmount(0);
                              setCardAmount(formData.totalValue || 0);
                            }
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

                  <div className="space-y-4">
                    {/* Detalhes de Dinheiro */}
                    {paymentMethod === 'Dinheiro' && (
                      <div className="animate-in fade-in">
                        <label className="text-[10px] font-black text-text-muted uppercase mb-1.5 block">Valor Recebido</label>
                        <input 
                          type="number" 
                          placeholder="0,00"
                          className="input h-10 font-bold"
                          value={receivedCash || ''}
                          onChange={(e) => setReceivedCash(Number(e.target.value))}
                        />
                        {receivedCash > (formData.totalValue || 0) && (
                          <div className="mt-2 p-2 bg-emerald-50 rounded-lg text-emerald-600 text-xs font-bold flex justify-between">
                            <span>Troco:</span>
                            <span>{formatCurrency(receivedCash - (formData.totalValue || 0))}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Detalhes Misto */}
                    {paymentMethod === 'Misto' && (
                      <div className="space-y-2 animate-in fade-in">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Dinheiro</label>
                            <input 
                              type="number" 
                              className="input h-9 px-2 text-xs font-bold"
                              value={cashAmount || ''}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setCashAmount(val);
                                setCardAmount(Math.max(0, (formData.totalValue || 0) - val));
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Cartão</label>
                            <input 
                              type="number" 
                              className="input h-9 px-2 text-xs font-bold"
                              value={cardAmount || ''}
                              onChange={(e) => setCardAmount(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Dispositivo</label>
                           <select 
                            className="input h-9 text-xs py-0"
                            value={selectedMachineId}
                            onChange={(e) => setSelectedMachineId(e.target.value)}
                          >
                            {machines.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

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
                </div>

                <div className="bg-primary/10 p-4 rounded-xl flex justify-between items-center border border-primary/20">
                  <span className="text-xs font-bold text-primary italic uppercase tracking-widest">Valor à Receber</span>
                  <span className="text-2xl font-black text-primary">{formatCurrency(formData.totalValue || 0)}</span>
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
          <div className="flex gap-3">
            <button 
              type="button"
              className="btn-secondary flex items-center gap-2"
              onClick={() => window.print()}
            >
              <Printer size={18} />
              Imprimir
            </button>
            
            {os && (
              <button 
                type="button"
                className="btn-secondary flex items-center gap-2 text-primary"
                onClick={() => {
                  const url = `${window.location.origin}${window.location.pathname}?os=${os.id}`;
                  navigator.clipboard.writeText(url).then(() => {
                    toast.success('Link de consulta copiado!');
                  });
                }}
              >
                <Share2 size={18} />
                Link Cliente
              </button>
            )}
          </div>
          
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

      {/* RENDERIZAÇÃO PROFISSIONAL PARA IMPRESSÃO A4 */}
      {os && (
        <div className="fixed inset-0 bg-white z-[100] p-0 text-black font-sans print-only overflow-hidden a4-container" style={{ display: 'none' }}>
           <div className="a4-content">
              {/* Cabeçalho Profissional - PADRÃO ÚNICO */}
              <header className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
                 <div className="flex items-center gap-4">
                    {storeSettings.logoUrl ? (
                      <img src={storeSettings.logoUrl} alt="Logo" className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xl">
                         {storeSettings.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                       <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">{storeSettings.name}</h1>
                       <div className="text-[9px] font-bold text-slate-600 space-y-0 mt-0.5 leading-tight">
                          <p>{storeSettings.corporateName}</p>
                          <p>CNPJ: {storeSettings.cnpj} | {storeSettings.address}</p>
                          <p>Fone: {storeSettings.phone1} {storeSettings.phone2 ? ` / ${storeSettings.phone2}` : ''}</p>
                       </div>
                    </div>
                 </div>
                 <div className="text-right flex flex-col items-end">
                    <div className="bg-slate-900 text-white px-6 py-2 rounded-bl-2xl">
                       <p className="text-[8px] font-black uppercase tracking-widest opacity-80">Ordem de Serviço</p>
                       <h2 className="text-2xl font-black">#{os.id}</h2>
                    </div>
                    <p className="text-[8px] font-bold mt-1 text-slate-500 uppercase tracking-widest">
                       {os.type === 'Retorno' ? 'GARANTIA / RETORNO' : 'ENTRADA DE EQUIPAMENTO'}
                    </p>
                    <p className="text-[10px] font-black mt-0.5 uppercase italic">{formatDate(os.createdAt)}</p>
                 </div>
              </header>

              <div className="space-y-4 flex-1">
                 {/* 1. SEÇÃO CLIENTE E EQUIPAMENTO */}
                 <div className="grid grid-cols-2 gap-3">
                    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                       <h3 className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Dados do Cliente</h3>
                       <p className="text-base font-black text-slate-900 uppercase leading-none mb-2">{os.customerName}</p>
                       <div className="grid grid-cols-2 gap-y-1 text-[10px] font-bold text-slate-700">
                          <div>
                             <span className="text-[7px] uppercase text-slate-400 block">CPF/CNPJ</span>
                             {customers.find(c => c.id === os.customerId)?.cpf || 'N/A'}
                          </div>
                          <div>
                             <span className="text-[7px] uppercase text-slate-400 block">Telefone</span>
                             {customers.find(c => c.id === os.customerId)?.phone || 'N/A'}
                          </div>
                          <div className="col-span-2">
                             <span className="text-[7px] uppercase text-slate-400 block font-black">Endereço</span>
                             <span className="line-clamp-1">{customers.find(c => c.id === os.customerId)?.address || 'N/A'}</span>
                          </div>
                       </div>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                       <h3 className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Equipamento / Aparelho</h3>
                       <p className="text-base font-black text-slate-900 uppercase leading-none mb-2">{os.device} {os.model}</p>
                       <div className="grid grid-cols-2 gap-y-1 text-[10px] font-bold text-slate-700">
                          <div>
                             <span className="text-[7px] uppercase text-slate-400 block">IMEI / SN</span>
                             <span className="truncate block">{os.imei || 'N/A'}</span>
                          </div>
                          <div>
                             <span className="text-[7px] uppercase text-slate-400 block">Cor / Detalhes</span>
                             {os.color || 'N/A'} / {os.storage || '--'}
                          </div>
                          <div className="col-span-2">
                             <span className="text-[7px] uppercase text-slate-400 block">Observações do Recebimento</span>
                             <span className="line-clamp-1 italic text-[9px]">{os.technicalNotes || 'Nenhuma observação'}</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* 2. DESCRIÇÃO DO PROBLEMA */}
                 <div className="border-l-4 border-slate-900 bg-slate-100/50 p-3">
                    <h3 className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Defeito Reclamado / Descrição Técnica</h3>
                    <p className="text-[11px] font-bold text-slate-800 italic leading-snug whitespace-pre-wrap">
                       {os.problem}
                    </p>
                 </div>

                 {/* 3. SERVIÇOS E PEÇAS */}
                 <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-900 text-white">
                             <th className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest">Descrição dos Serviços / Peças</th>
                             <th className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-center">Quant</th>
                             <th className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-right">Unitário</th>
                             <th className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-right">Subtotal</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 text-[10px] font-bold">
                          {os.items && os.items.length > 0 ? os.items.map(item => (
                            <tr key={item.id}>
                              <td className="px-3 py-1.5 text-slate-800">{item.description}</td>
                              <td className="px-3 py-1.5 text-center text-slate-600">{item.quantity}</td>
                              <td className="px-3 py-1.5 text-right text-slate-600">{formatCurrency(item.unitValue)}</td>
                              <td className="px-3 py-1.5 text-right text-slate-900">{formatCurrency(item.totalValue)}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td className="px-3 py-4 text-slate-400 uppercase text-center font-black tracking-widest opacity-20" colSpan={4}>Aguardando finalização do serviço técnico</td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                 </div>

                 {/* 4. GARANTIA E OBSERVACÕES */}
                 <div className="grid grid-cols-2 gap-3">
                    <div className="border border-slate-200 p-3 rounded-lg">
                       <h4 className="text-[8px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">Termos de Garantia</h4>
                       <div className="text-[9px] font-bold text-slate-600 leading-tight space-y-0.5">
                          <p>• Garantia legal de 90 dias com base no CDC para peças substituídas.</p>
                          <p>• A garantia não cobre: quebras, líquidos, selos rompidos ou mau uso.</p>
                          <p>• Equipamentos abandonados em 90 dias terão destino conforme lei vigente.</p>
                       </div>
                    </div>
                    <div className="border border-slate-200 p-3 rounded-lg">
                       <h4 className="text-[8px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">Observações Adicionais</h4>
                       <p className="text-[9px] font-bold text-slate-600 leading-tight italic line-clamp-3">
                          {os.technicalNotes || "Sem observações adicionais para este documento."}
                       </p>
                    </div>
                 </div>
              </div>

              {/* 5. FINANCEIRO E ASSINATURAS */}
              <div className="mt-4 pt-4 border-t-2 border-slate-900">
                 <div className="grid grid-cols-3 gap-6 items-end">
                    <div className="col-span-2 flex flex-col gap-8">
                       <div className="grid grid-cols-2 gap-6">
                          <div className="flex flex-col items-center">
                             <div className="w-full h-px bg-slate-900"></div>
                             <p className="text-[7px] font-black uppercase mt-1">Assinatura do Cliente</p>
                          </div>
                           <div className="flex flex-col items-center">
                             <div className="w-full h-px bg-slate-900"></div>
                             <p className="text-[7px] font-black uppercase mt-1">Responsável Técnico</p>
                          </div>
                       </div>
                       <footer className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                          Documento emitido eletronicamente em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                       </footer>
                    </div>
                    
                    <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col justify-between">
                       <div className="space-y-1 mb-2">
                          <div className="flex justify-between items-center text-[8px] font-bold opacity-70 uppercase">
                             <span>Valor Total</span>
                             <span>{formatCurrency(os.totalValue)}</span>
                          </div>
                          <div className="h-px bg-white/10"></div>
                          <div className="flex justify-between items-end">
                             <span className="text-[8px] uppercase font-black tracking-widest">Total Líquido</span>
                             <span className="text-xl font-black">{formatCurrency(os.totalValue)}</span>
                          </div>
                       </div>
                       <div className="border-t border-white/10 pt-2 text-[8px] font-bold">
                          <p className="uppercase text-white/40 tracking-widest">Pagamento: <span className="text-white opacity-100">{paymentMethod || 'A Definir'}</span></p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
