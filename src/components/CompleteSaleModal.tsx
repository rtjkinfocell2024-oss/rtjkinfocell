import { useState, useEffect, FormEvent } from 'react';
import { X, Save, Smartphone, User, DollarSign, FileText, UserPlus, ShieldCheck, Database, Cpu, CreditCard, Zap } from 'lucide-react';
import { cn, formatCurrency } from '@/src/lib/utils';
import { DetailedSale, Customer, PaymentMachine, Transaction } from '@/src/types';

interface CompleteSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sale: DetailedSale) => void;
  onSaveTransaction: (tx: Transaction) => void;
  sale?: DetailedSale | null;
  mode: 'create' | 'edit';
  customers: Customer[];
  machines: PaymentMachine[];
  onQuickAddCustomer: () => void;
}

const warrantyOptions = ['30', '60', '90', '180'];

export function CompleteSaleModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onSaveTransaction,
  sale, 
  mode, 
  customers, 
  machines,
  onQuickAddCustomer
}: CompleteSaleModalProps) {
  const [formData, setFormData] = useState<Partial<DetailedSale>>({
    customerId: '',
    customerName: '',
    paymentMethod: 'PIX',
    warranty: '90',
    observations: '',
    installments: 1,
    machineId: machines[0]?.id || '',
    pixMethod: 'C6 Bank'
  });

  const [productDetails, setProductDetails] = useState({
    name: '',
    model: '',
    imei1: '',
    imei2: '',
    sn: '',
    color: '',
    storage: '',
    ram: '',
    price: 0
  });

  const [customWarranty, setCustomWarranty] = useState('');
  const [warrantyMode, setWarrantyMode] = useState<'preset' | 'custom'>('preset');

  useEffect(() => {
    if (sale) {
      setFormData(sale);
      setProductDetails({
        name: sale.items[0]?.name || '',
        model: sale.model || '',
        imei1: sale.imei || '',
        imei2: sale.imei2 || '',
        sn: sale.sn || '',
        color: sale.color || '',
        storage: sale.storage || '',
        ram: sale.ram || '',
        price: sale.items[0]?.price || 0
      });
      
      const w = sale.warranty.replace(' dias', '');
      if (warrantyOptions.includes(w)) {
        setFormData(prev => ({ ...prev, warranty: w }));
        setWarrantyMode('preset');
      } else {
        setFormData(prev => ({ ...prev, warranty: 'custom' }));
        setWarrantyMode('custom');
        setCustomWarranty(sale.warranty);
      }
    } else {
      setFormData({
        customerId: '',
        customerName: '',
        paymentMethod: 'PIX',
        warranty: '90',
        observations: '',
        installments: 1,
        machineId: machines[0]?.id || '',
        pixMethod: 'C6 Bank'
      });
      setProductDetails({
        name: '',
        model: '',
        imei1: '',
        imei2: '',
        sn: '',
        color: '',
        storage: '',
        ram: '',
        price: 0
      });
      setWarrantyMode('preset');
      setCustomWarranty('');
    }
  }, [sale, isOpen, machines]);

  if (!isOpen) return null;

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setFormData({
      ...formData,
      customerId: customerId,
      customerName: customer ? customer.name : 'CONSUMIDOR FINAL'
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const finalWarranty = warrantyMode === 'custom' ? customWarranty : `${formData.warranty} dias`;
    const subtotal = productDetails.price;
    
    const selectedMachine = machines.find(m => m.id === formData.machineId);
    let feePercentage = 0;
    if (formData.paymentMethod === 'PIX') feePercentage = selectedMachine?.pixFee || 0;
    else if (formData.paymentMethod === 'Débito') feePercentage = selectedMachine?.debitFee || 0;
    else if (formData.paymentMethod === 'Crédito') feePercentage = selectedMachine?.creditFees[formData.installments || 1] || 0;
    
    const machineFee = subtotal * (feePercentage / 100);
    const total = subtotal - machineFee;

    const saleId = sale?.id || Math.floor(Math.random() * 10000).toString();
    
    const newSale: DetailedSale = {
      id: saleId,
      customerId: formData.customerId || '',
      customerName: formData.customerName || 'CONSUMIDOR FINAL',
      items: [{ id: 'device', name: productDetails.name, quantity: 1, price: productDetails.price, type: 'product' }],
      subtotal,
      discount: 0,
      total,
      paymentMethod: formData.paymentMethod as any,
      machineFee,
      netValue: total,
      createdAt: sale?.createdAt || new Date().toISOString(),
      imei: productDetails.imei1,
      imei2: productDetails.imei2,
      sn: productDetails.sn,
      model: productDetails.model,
      color: productDetails.color,
      storage: productDetails.storage,
      ram: productDetails.ram,
      warranty: finalWarranty,
      observations: formData.observations || '',
      status: 'Finalizada',
      machineId: formData.machineId,
      installments: formData.installments || 1,
      pixMethod: formData.paymentMethod === 'PIX' ? formData.pixMethod : undefined
    };

    const newTransaction: Transaction = {
      id: saleId,
      type: 'Entrada',
      category: 'Venda de Dispositivo',
      description: `Venda ${productDetails.name} (${productDetails.model}) - Cliente: ${newSale.customerName} [Garantia: ${finalWarranty}]`,
      value: total,
      date: newSale.createdAt,
      machineId: formData.machineId,
      installments: formData.installments || 1,
      customerId: formData.customerId || undefined,
      pixMethod: formData.pixMethod
    };

    onSave(newSale);
    onSaveTransaction(newTransaction);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
        <header className="px-6 py-4 border-b border-border flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold">
              {mode === 'create' ? 'Nova Venda de Aparelho' : 'Editar Venda'}
            </h3>
            <p className="text-xs text-text-muted">Preencha os dados e finalize em segundos.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Seção Cliente */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Cliente</h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                <select 
                  className="input pl-8 text-xs h-10 appearance-none pr-8 bg-slate-50/50"
                  value={formData.customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                >
                  <option value="">Consumidor Final</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={14} />
              </div>
              <button 
                type="button"
                onClick={onQuickAddCustomer}
                className="h-10 w-10 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all"
              >
                <UserPlus size={18} />
              </button>
            </div>
          </div>

          {/* Seção Aparelho */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Dados do Aparelho</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 col-span-2">
                <input 
                  type="text" 
                  placeholder="Nome do Aparelho (ex: iPhone 13)" 
                  className="input h-10 text-sm"
                  required
                  value={productDetails.name}
                  onChange={(e) => setProductDetails({...productDetails, name: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-1">
                <input 
                  type="text" 
                  placeholder="Modelo" 
                  className="input h-10 text-sm"
                  value={productDetails.model}
                  onChange={(e) => setProductDetails({...productDetails, model: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-1">
                <input 
                  type="text" 
                  placeholder="Cor" 
                  className="input h-10 text-sm"
                  value={productDetails.color}
                  onChange={(e) => setProductDetails({...productDetails, color: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-1">
                <input 
                  type="text" 
                  placeholder="IMEI 1" 
                  className="input h-10 text-sm border-red-50"
                  value={productDetails.imei1}
                  onChange={(e) => setProductDetails({...productDetails, imei1: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-1">
                <input 
                  type="text" 
                  placeholder="IMEI 2" 
                  className="input h-10 text-sm border-red-50"
                  value={productDetails.imei2}
                  onChange={(e) => setProductDetails({...productDetails, imei2: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-1">
                <input 
                  type="text" 
                  placeholder="S/N" 
                  className="input h-10 text-sm"
                  value={productDetails.sn}
                  onChange={(e) => setProductDetails({...productDetails, sn: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="GB" 
                  className="input h-10 text-sm"
                  value={productDetails.storage}
                  onChange={(e) => setProductDetails({...productDetails, storage: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="RAM" 
                  className="input h-10 text-sm"
                  value={productDetails.ram}
                  onChange={(e) => setProductDetails({...productDetails, ram: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={16} />
                  <input 
                    type="number" 
                    placeholder="Preço de Venda" 
                    className="input h-11 pl-10 text-base font-black text-primary"
                    required
                    value={productDetails.price || ''}
                    onChange={(e) => setProductDetails({...productDetails, price: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção Garantia */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Garantia</h4>
            <div className="grid grid-cols-5 gap-2">
              {warrantyOptions.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setFormData({...formData, warranty: d});
                    setWarrantyMode('preset');
                  }}
                  className={cn(
                    "py-2 rounded-xl text-xs font-bold border transition-all",
                    formData.warranty === d && warrantyMode === 'preset'
                      ? "bg-primary text-white border-primary shadow-sm" 
                      : "bg-white text-text-muted border-border hover:bg-slate-50"
                  )}
                >
                  {d}d
                </button>
              ))}
              <button
                type="button"
                onClick={() => setWarrantyMode('custom')}
                className={cn(
                  "py-2 rounded-xl text-xs font-bold border transition-all",
                  warrantyMode === 'custom'
                    ? "bg-primary text-white border-primary shadow-sm" 
                    : "bg-white text-text-muted border-border hover:bg-slate-50"
                )}
              >
                Custom
              </button>
            </div>
            {warrantyMode === 'custom' && (
              <input 
                type="text" 
                placeholder="Ex: 1 ano / Vitalícia" 
                className="input h-10 text-sm mt-2 animate-in slide-in-from-top-2"
                value={customWarranty}
                onChange={(e) => setCustomWarranty(e.target.value)}
              />
            )}
          </div>

          {/* Seção Observação */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Observação</h4>
            <textarea 
              className="input text-sm min-h-[60px] py-2" 
              placeholder="Notas extras..."
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            />
          </div>

          {/* Seção Pagamento */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Forma de Pagamento</h4>
            <div className="grid grid-cols-3 gap-2">
              {['PIX', 'Dinheiro', 'Cartão'].map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    // Mapping "Cartão" to "Crédito" by default for detailed sale or toggle?
                    // User said "Cartão", the previous was Débito/Crédito.
                    // For simplicity, let's allow child selection or just default to Crédito if Cartão
                    const actualMethod = method === 'Cartão' ? 'Crédito' : method;
                    setFormData({...formData, paymentMethod: actualMethod as any});
                  }}
                  className={cn(
                    "py-4 rounded-2xl text-xs font-black border transition-all flex flex-col items-center gap-1",
                    (formData.paymentMethod === method || (method === 'Cartão' && (formData.paymentMethod === 'Crédito' || formData.paymentMethod === 'Débito')))
                      ? "bg-primary text-white border-primary shadow-sm" 
                      : "bg-slate-50 text-text-muted border-border hover:bg-white"
                  )}
                >
                  {method === 'PIX' && <Zap size={18} />}
                  {method === 'Dinheiro' && <DollarSign size={18} />}
                  {method === 'Cartão' && <CreditCard size={18} />}
                  {method}
                </button>
              ))}
            </div>

            {/* Sub-opções de Pagamento */}
            {(formData.paymentMethod === 'PIX') && (
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-border animate-in fade-in">
                {['C6 Bank', 'Máquina Rede', 'CNPJ', 'Infinity Play'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormData({...formData, pixMethod: m})}
                    className={cn(
                      "py-2 rounded-lg text-[10px] font-black border uppercase transition-all",
                      formData.pixMethod === m ? "bg-primary text-white border-primary" : "bg-white text-text-muted"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {(formData.paymentMethod === 'Crédito' || formData.paymentMethod === 'Débito') && (
              <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-border animate-in fade-in">
                <div className="flex gap-2 mb-2">
                  {['Débito', 'Crédito'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: m as any})}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[10px] font-black border uppercase transition-all",
                        formData.paymentMethod === m ? "bg-slate-900 text-white border-slate-900" : "bg-white text-text-muted"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Maquininha</label>
                  <select 
                    className="input h-9 text-xs py-1"
                    value={formData.machineId}
                    onChange={(e) => setFormData({...formData, machineId: e.target.value})}
                  >
                    {machines.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {formData.paymentMethod === 'Crédito' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Parcelas</label>
                    <select 
                      className="input h-9 text-xs py-1 font-bold"
                      value={formData.installments}
                      onChange={(e) => setFormData({...formData, installments: Number(e.target.value)})}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(i => (
                        <option key={i} value={i}>{i}x de {formatCurrency(productDetails.price / i)}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        <footer className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-slate-50">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit} 
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <CheckCircle2 size={18} />
            Finalizar Venda
          </button>
        </footer>
      </div>
    </div>
  );
}

const ChevronDown = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const CheckCircle2 = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
