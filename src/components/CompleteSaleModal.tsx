import { useState, useEffect, FormEvent, useMemo } from 'react';
import { X, Save, Smartphone, User, DollarSign, FileText, UserPlus, ShieldCheck, Database, Cpu, CreditCard, Zap, Package, ChevronDown, CheckCircle2 } from 'lucide-react';
import { cn, formatCurrency, formatBRLInput, parseBRLInput, parseCentsBRLInput } from '@/src/lib/utils';
import { DetailedSale, Customer, PaymentMachine, Transaction, Product } from '@/src/types';

interface CompleteSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sale: DetailedSale) => void;
  onSaveTransaction: (tx: Transaction) => void;
  onSaveProduct: (product: Product) => void;
  sale?: DetailedSale | null;
  mode: 'create' | 'edit';
  products: Product[];
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
  onSaveProduct,
  sale, 
  mode, 
  products,
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
    id: '',
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

  const [productSearch, setProductSearch] = useState('');
  const [showProductResults, setShowProductResults] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return [];
    return products.filter(p => 
      !p.isSold && 
      p.category === 'Celular' && 
      (p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
       p.model?.toLowerCase().includes(productSearch.toLowerCase()) ||
       p.imei1?.includes(productSearch))
    );
  }, [products, productSearch]);

  const handleSelectProduct = (product: Product) => {
    setProductDetails({
      id: product.id,
      name: product.name,
      model: product.model || '',
      imei1: product.imei1 || '',
      imei2: product.imei2 || '',
      sn: product.sn || '',
      color: product.color || '',
      storage: product.storage || '',
      ram: product.ram || '',
      price: product.price
    });
    setProductSearch('');
    setShowProductResults(false);
  };

  const [customWarranty, setCustomWarranty] = useState('');
  const [warrantyMode, setWarrantyMode] = useState<'preset' | 'custom'>('preset');

  // Novos estados para Pagamento
  const [receivedCash, setReceivedCash] = useState(0);
  const [cashAmount, setCashAmount] = useState(0); // Para Misto
  const [cardAmount, setCardAmount] = useState(0); // Para Misto

  useEffect(() => {
    if (sale) {
      setFormData(sale);
      setProductDetails({
        id: '',
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
        id: '',
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

    const subtotal = productDetails.price;
    if (formData.paymentMethod === 'Misto' && Math.round(cashAmount + cardAmount) < Math.round(subtotal)) {
      alert('O valor total informado é menor que o valor da venda!');
      return;
    }

    if (formData.paymentMethod === 'Dinheiro' && receivedCash < subtotal) {
      alert('Valor em dinheiro insuficiente!');
      return;
    }
    
    const finalWarranty = warrantyMode === 'custom' ? customWarranty : `${formData.warranty} dias`;
    
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

    // Registrar Transações (Suporte Misto)
    if (formData.paymentMethod === 'Misto') {
      if (cashAmount > 0) {
        onSaveTransaction({
          id: `${saleId}-1`,
          type: 'Entrada',
          category: 'Venda de Dispositivo (Mista - Dinheiro)',
          description: `Venda ${productDetails.name} (Parte Dinheiro) - Cliente: ${newSale.customerName}`,
          value: cashAmount,
          date: newSale.createdAt,
          customerId: formData.customerId || undefined,
        });
      }
      if (cardAmount > 0) {
        onSaveTransaction({
          id: `${saleId}-2`,
          type: 'Entrada',
          category: 'Venda de Dispositivo (Mista - Cartão)',
          description: `Venda ${productDetails.name} (Parte Cartão) - Cliente: ${newSale.customerName} (${formData.installments}x)`,
          value: cardAmount,
          date: newSale.createdAt,
          machineId: formData.machineId,
          installments: formData.installments || 1,
          customerId: formData.customerId || undefined,
        });
      }
    } else {
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
      onSaveTransaction(newTransaction);
    }

    // Atualizar estoque se for um novo produto selecionado
    if (productDetails.id) {
      const selectedProduct = products.find(p => p.id === productDetails.id);
      if (selectedProduct) {
        onSaveProduct({
          ...selectedProduct,
          isSold: true,
          stock: Math.max(0, (selectedProduct.stock || 0) - 1)
        });
      }
    }

    onSave(newSale);
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
          {/* Busca de Produto */}
          <div className="space-y-2 relative">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Buscar Produto em Estoque</h4>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
              <input 
                type="text" 
                className="input pl-8 text-xs h-10" 
                placeholder="Busque por Nome, Modelo ou IMEI..."
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowProductResults(true);
                }}
                onFocus={() => setShowProductResults(true)}
              />
            </div>
            
            {showProductResults && filteredProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProduct(p)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-border last:border-0 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-black group-hover:text-primary transition-colors">{p.name} {p.model}</span>
                      <span className="text-[10px] text-text-muted font-bold">IMEI: {p.imei1 || 'N/A'} • {p.storage || '-'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-primary">{formatCurrency(p.price)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-black text-xs">R$</span>
                  <input 
                    type="text" 
                    placeholder="Preço de Venda" 
                    className="input h-11 pl-10 text-base font-black text-primary"
                    required
                    value={formatBRLInput(productDetails.price)}
                    onChange={(e) => setProductDetails({...productDetails, price: parseCentsBRLInput(e.target.value)})}
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
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Forma de Pagamento</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['PIX', 'Dinheiro', 'Cartão', 'Misto'].map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    const actualMethod = method === 'Cartão' ? 'Crédito' : method;
                    setFormData({...formData, paymentMethod: actualMethod as any});
                    if (method === 'Misto') {
                      setCashAmount(0);
                      setCardAmount(productDetails.price);
                    }
                  }}
                  className={cn(
                    "py-3 rounded-2xl text-[10px] font-black border transition-all flex flex-col items-center gap-1",
                    (formData.paymentMethod === method || 
                     (method === 'Cartão' && (formData.paymentMethod === 'Crédito' || formData.paymentMethod === 'Débito')) ||
                     (method === 'Misto' && formData.paymentMethod === 'Misto'))
                      ? "bg-primary text-white border-primary shadow-sm" 
                      : "bg-slate-50 text-text-muted border-border hover:bg-white"
                  )}
                >
                  {method === 'PIX' && <Zap size={16} />}
                  {method === 'Dinheiro' && <DollarSign size={16} />}
                  {method === 'Cartão' && <CreditCard size={16} />}
                  {method === 'Misto' && <Package size={16} />}
                  {method}
                </button>
              ))}
            </div>

            {/* Detalhes de Dinheiro (Troco) */}
            {formData.paymentMethod === 'Dinheiro' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-border animate-in fade-in space-y-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor Recebido</label>
                  <input 
                    type="text" 
                    className="input h-9 text-sm font-bold"
                    placeholder="0,00"
                    value={formatBRLInput(receivedCash)}
                    onChange={(e) => setReceivedCash(parseCentsBRLInput(e.target.value))}
                  />
                </div>
                {receivedCash > productDetails.price && (
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
                    <span>Troco:</span>
                    <span className="text-sm font-black">{formatCurrency(receivedCash - productDetails.price)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Detalhes Misto */}
            {formData.paymentMethod === 'Misto' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-border animate-in fade-in space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dinheiro</label>
                    <input 
                      type="text" 
                      className="input h-9 text-xs font-bold"
                      value={formatBRLInput(cashAmount)}
                      onChange={(e) => {
                        const val = parseCentsBRLInput(e.target.value);
                        setCashAmount(val);
                        setCardAmount(Math.max(0, productDetails.price - val));
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cartão</label>
                    <input 
                      type="text" 
                      className="input h-9 text-xs font-bold"
                      value={formatBRLInput(cardAmount)}
                      onChange={(e) => setCardAmount(parseCentsBRLInput(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Maquininha</label>
                   <select 
                    className="input h-9 text-xs py-0"
                    value={formData.machineId}
                    onChange={(e) => setFormData({...formData, machineId: e.target.value})}
                  >
                    {machines.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Sub-opções de Pagamento (PIX e Cartão Convencional) */}
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


