import { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  Zap, 
  CheckCircle2, 
  User, 
  ChevronDown, 
  Search,
  UserPlus,
  X,
  Printer,
  FileText,
  Package,
  Wrench,
  ChevronRight
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/src/lib/utils';
import { Product, SaleItem, Transaction, Customer, PaymentMachine, StoreSettings } from '@/src/types';
import { CustomerModal } from './CustomerModal';

interface QuickSaleProps {
  products: Product[];
  customers: Customer[];
  machines: PaymentMachine[];
  onSaveTransaction: (tx: Transaction) => void;
  onSaveCustomer: (customer: Customer) => void;
  storeSettings: StoreSettings;
}

export function QuickSale({ products, customers, machines, onSaveTransaction, onSaveCustomer, storeSettings }: QuickSaleProps) {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedMachineId, setSelectedMachineId] = useState(machines[0]?.id || '');
  const [installments, setInstallments] = useState(1);
  const [pixMethod, setPixMethod] = useState('C6 Bank');
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [lastSaleId, setLastSaleId] = useState('');
  const [printMode, setPrintMode] = useState<'A4' | 'Coupon' | null>(null);
  const [soldItems, setSoldItems] = useState<SaleItem[]>([]);
  const [finalPaymentInfo, setFinalPaymentInfo] = useState({ 
    method: '', 
    pixMethod: '', 
    installments: 1, 
    customer: null as Customer | null,
    splitCash: 0,
    splitCard: 0,
    receivedCash: 0,
    change: 0
  });

  // Novos estados para Pagamento
  const [cashAmount, setCashAmount] = useState(0); // Para Misto
  const [cardAmount, setCardAmount] = useState(0); // Para Misto
  const [receivedCash, setReceivedCash] = useState(0); // Valor entregue pelo cliente

  // Search Logic
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5);
  }, [products, searchQuery]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const selectedMachine = machines.find(m => m.id === selectedMachineId);
  
  let feePercentage = 0;
  if (paymentMethod === 'PIX') feePercentage = selectedMachine?.pixFee || 0;
  else if (paymentMethod === 'Débito') feePercentage = selectedMachine?.debitFee || 0;
  else if (paymentMethod === 'Crédito') feePercentage = selectedMachine?.creditFees[installments] || 0;
  
  const machineFee = subtotal * (feePercentage / 100);
  const total = subtotal - machineFee;

  const change = Math.max(0, receivedCash - (paymentMethod === 'Dinheiro' ? subtotal : cashAmount));
  const remainingTotal = subtotal - (paymentMethod === 'Misto' ? (cashAmount + cardAmount) : 0);
  const isPaymentIncomplete = paymentMethod === 'Misto' && Math.round(cashAmount + cardAmount) < Math.round(subtotal);
  const isCashInsufficient = paymentMethod === 'Dinheiro' && receivedCash < subtotal && receivedCash > 0;

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const addToCart = (product: Product | { id: string, name: string, price: number, type: 'product' | 'service' }) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1, 
        type: 'type' in product ? product.type : 'product' 
      }]);
    }
    setSearchQuery('');
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleFinishSale = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'Misto' && Math.round(cashAmount + cardAmount) < Math.round(subtotal)) {
      alert('O valor total informado é menor que o valor dos itens!');
      return;
    }

    if (paymentMethod === 'Dinheiro' && receivedCash < subtotal) {
      alert('Valor recebido em dinheiro insuficiente!');
      return;
    }

    const saleId = Math.floor(Math.random() * 10000).toString();
    const customerInfo = selectedCustomer ? ` - Cliente: ${selectedCustomer.name}` : '';
    const paymentInfo = paymentMethod === 'Crédito' ? ` (${installments}x)` : '';
    const pixInfo = paymentMethod === 'PIX' ? ` [${pixMethod}]` : '';
    
    // Registrar Transações
    if (paymentMethod === 'Misto') {
      // Registrar Dinheiro
      if (cashAmount > 0) {
        onSaveTransaction({
          id: `${saleId}-1`,
          type: 'Entrada',
          category: 'Venda (Mista - Dinheiro)',
          description: `Venda PDV (Mista): ${cart.map(i => i.name).join(', ')}${customerInfo}`,
          value: cashAmount,
          date: new Date().toISOString(),
          customerId: selectedCustomerId || undefined,
        });
      }
      // Registrar Cartão
      if (cardAmount > 0) {
        onSaveTransaction({
          id: `${saleId}-2`,
          type: 'Entrada',
          category: 'Venda (Mista - Cartão)',
          description: `Venda PDV (Mista): ${cart.map(i => i.name).join(', ')}${customerInfo}${paymentInfo}`,
          value: cardAmount,
          date: new Date().toISOString(),
          machineId: selectedMachineId,
          installments: installments,
          customerId: selectedCustomerId || undefined,
        });
      }
    } else {
      const newTransaction: Transaction = {
        id: saleId,
        type: 'Entrada',
        category: 'Venda',
        description: `Venda PDV: ${cart.map(i => i.name).join(', ')}${customerInfo}${paymentInfo}${pixInfo}`,
        value: total,
        date: new Date().toISOString(),
        machineId: selectedMachineId,
        installments: paymentMethod === 'Crédito' ? installments : 1,
        customerId: selectedCustomerId || undefined,
        pixMethod: paymentMethod === 'PIX' ? pixMethod : undefined
      };
      onSaveTransaction(newTransaction);
    }

    setLastSaleId(saleId);
    setSoldItems([...cart]);
    setFinalPaymentInfo({ 
      method: paymentMethod, 
      pixMethod: paymentMethod === 'PIX' ? pixMethod : '', 
      installments: paymentMethod === 'Crédito' ? installments : 1,
      customer: selectedCustomer || null,
      splitCash: cashAmount,
      splitCard: cardAmount,
      receivedCash: receivedCash,
      change: change
    });
    setIsSuccess(true);
    setCart([]);
    setSelectedCustomerId('');
    setInstallments(1);
    setReceivedCash(0);
    setCashAmount(0);
    setCardAmount(0);
  };

  const handlePrint = (mode: 'A4' | 'Coupon') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 100);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-24 lg:pb-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        
        {/* Lado Esquerdo: Busca e Produtos */}
        <div className="flex flex-col gap-6 order-2 lg:order-1">
          <div className="card">
            <div className="card-header border-b border-border bg-slate-50/50 flex items-center justify-between gap-4">
               <h3 className="card-title flex items-center gap-2">
                 <Search size={18} className="text-primary" />
                 Busca de Itens
               </h3>
               <div className="flex-1 max-w-md relative">
                 <input 
                  type="text" 
                  placeholder="Buscar produto ou serviço..." 
                  className="input pl-10 h-10 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                 />
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                 
                 {/* Sugestões */}
                 {searchQuery && (
                   <div className="absolute top-full left-0 right-0 bg-white border border-border mt-1 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-border animate-in slide-in-from-top-1">
                     {filteredProducts.length > 0 ? (
                       filteredProducts.map(p => (
                         <button 
                           key={p.id}
                           onClick={() => addToCart(p)}
                           className="w-full p-3 flex items-center justify-between hover:bg-primary/5 transition-colors text-left"
                         >
                           <div className="flex flex-col">
                             <span className="text-xs font-bold">{p.name}</span>
                             <span className="text-[10px] text-text-muted uppercase">{p.category}</span>
                           </div>
                           <span className="text-xs font-black text-primary">{formatCurrency(p.price)}</span>
                         </button>
                       ))
                     ) : (
                       <div className="p-4 text-center text-xs text-text-muted italic">Nenhum produto encontrado.</div>
                     )}
                   </div>
                 )}
               </div>
            </div>

            <div className="card-content p-6 flex flex-col gap-8">
              {/* Categorias Rápidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'cat-1', name: 'Cabos', icon: Smartphone, color: 'bg-blue-50 text-blue-600' },
                  { id: 'cat-2', name: 'Carregador', icon: Zap, color: 'bg-yellow-50 text-yellow-600' },
                  { id: 'cat-3', name: 'Películas', icon: Smartphone, color: 'bg-emerald-50 text-emerald-600' },
                  { id: 'cat-4', name: 'Reparos', icon: Wrench, color: 'bg-purple-50 text-purple-600' },
                ].map(cat => (
                  <button key={cat.id} className={cn("p-4 rounded-2xl border border-border hover:border-primary transition-all flex flex-col items-center gap-2 group", cat.color)}>
                    <cat.icon size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-text-main group-hover:text-primary transition-colors">{cat.name}</span>
                  </button>
                ))}
              </div>

              <div>
                <p className="text-[10px] font-black uppercase text-text-muted mb-4 tracking-widest">Serviços Rápidos</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 's-1', name: 'Limpeza', price: 80 },
                    { id: 's-2', name: 'Película', price: 15 },
                    { id: 's-3', name: 'Backup', price: 100 },
                  ].map(service => (
                    <button 
                      key={service.id}
                      onClick={() => addToCart({ ...service, type: 'service' })}
                      className="p-4 bg-white border border-border rounded-xl hover:shadow-md hover:border-primary transition-all text-left"
                    >
                      <p className="text-xs font-bold mb-1">{service.name}</p>
                      <p className="text-sm font-black text-primary">{formatCurrency(service.price)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Carrinho e Checkout */}
        <div className="flex flex-col gap-6 order-1 lg:order-2">
          <div className="card flex flex-col h-full min-h-[500px] border-2 border-primary/10 shadow-xl shadow-primary/5">
            <div className="card-header border-b border-border bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-xl text-white">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tighter">Carrinho</h3>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{cart.length} itens no pedido</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button onClick={() => setCart([])} className="p-2 text-text-muted hover:text-danger transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {/* Cliente Selector */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                  <select 
                    className="input pl-8 text-xs h-10 appearance-none pr-10"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                  >
                    <option value="">Consumidor Final</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={14} />
                </div>
                <button 
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all shadow-sm"
                  title="Novo Cliente"
                >
                  <UserPlus size={18} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-text-muted/30 py-10">
                  <Package size={64} strokeWidth={1} className="mb-4" />
                  <p className="font-bold text-sm">O carrinho está vazio</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-transparent hover:border-primary/20 transition-all group">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-text-main truncate">{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[10px] font-black text-primary">{item.quantity}x</span>
                           <span className="text-[10px] text-text-muted font-bold">{formatCurrency(item.price)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-black text-text-main">{formatCurrency(item.price * item.quantity)}</p>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout Footer */}
            <div className="p-6 bg-slate-50 border-t border-border flex flex-col gap-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {['PIX', 'Dinheiro', 'Débito', 'Crédito', 'Misto'].map(method => (
                  <button
                    key={method}
                    onClick={() => {
                      setPaymentMethod(method);
                      if (method !== 'Crédito' && method !== 'Misto') setInstallments(1);
                      if (method === 'Misto') {
                        setCashAmount(0);
                        setCardAmount(subtotal);
                      }
                    }}
                    className={cn(
                      "py-3 px-2 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-1 shadow-sm",
                      paymentMethod === method 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 ring-1 ring-primary-light" 
                        : "bg-white text-text-muted border-border hover:bg-slate-50"
                    )}
                  >
                    {method === 'PIX' && <Zap size={12} />}
                    {method === 'Dinheiro' && <DollarSign size={12} />}
                    {(method === 'Débito' || method === 'Crédito') && <CreditCard size={12} />}
                    {method === 'Misto' && <Package size={12} />}
                    {method}
                  </button>
                ))}
              </div>

              {/* Detalhes de Dinheiro com Troco */}
              {paymentMethod === 'Dinheiro' && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Valor Recebido</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={16} />
                      <input 
                        type="number" 
                        className={cn(
                          "input pl-10 font-bold",
                          isCashInsufficient ? "border-danger ring-danger/20" : ""
                        )}
                        placeholder="0,00"
                        value={receivedCash || ''}
                        onChange={(e) => setReceivedCash(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  {receivedCash > 0 && (
                    <div className={cn(
                      "p-4 rounded-2xl flex items-center justify-between animate-in zoom-in duration-300",
                      change > 0 ? "bg-emerald-50 border border-emerald-100" : "bg-slate-100 border border-slate-200"
                    )}>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seu Troco</p>
                        <p className={cn("text-2xl font-black", change > 0 ? "text-emerald-600" : "text-slate-400")}>
                          {formatCurrency(change)}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <DollarSign className={change > 0 ? "text-emerald-500" : "text-slate-300"} size={20} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Detalhes de Pagamento Misto */}
              {paymentMethod === 'Misto' && (
                <div className="p-4 bg-white rounded-2xl border border-primary/20 space-y-4 animate-in slide-in-from-right-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Dinheiro</label>
                      <input 
                        type="number" 
                        className="input h-10 px-3 text-sm font-bold bg-slate-50 border-none"
                        value={cashAmount || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCashAmount(val);
                          setCardAmount(Math.max(0, subtotal - val));
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Cartão</label>
                      <input 
                        type="number" 
                        className="input h-10 px-3 text-sm font-bold bg-slate-50 border-none"
                        value={cardAmount || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCardAmount(val);
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Dispositivo Cartão</label>
                    <select 
                      className="input text-xs py-2 pr-10 appearance-none bg-slate-50/50"
                      value={selectedMachineId}
                      onChange={(e) => setSelectedMachineId(e.target.value)}
                    >
                      {machines.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  {isPaymentIncomplete && (
                    <div className="p-2 bg-danger/10 border border-danger/20 rounded-lg text-danger text-[10px] font-bold text-center">
                      Faltam {formatCurrency(subtotal - (cashAmount + cardAmount))} para completar o total
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'PIX' && (
                <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-primary/20 animate-in slide-in-from-right-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Origem PIX</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['C6 Bank', 'Máquina Rede', 'CNPJ', 'Infinity Play'].map(m => (
                        <button
                          key={m}
                          onClick={() => setPixMethod(m)}
                          className={cn(
                            "py-2 px-1 rounded-lg text-[10px] font-bold border transition-all",
                            pixMethod === m ? "bg-primary text-white border-primary" : "bg-slate-50 border-border"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {['Débito', 'Crédito'].includes(paymentMethod) && (
                <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-primary/20 animate-in slide-in-from-right-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Dispositivo</label>
                    <div className="relative">
                      <select 
                        className="input text-xs py-2 pr-10 appearance-none bg-slate-50/50"
                        value={selectedMachineId}
                        onChange={(e) => setSelectedMachineId(e.target.value)}
                      >
                        {machines.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    </div>
                  </div>

                  {paymentMethod === 'Crédito' && (
                    <div className="flex flex-col gap-1.5 animate-in fade-in">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Parcelas</label>
                      <div className="relative">
                        <select 
                          className="input text-xs py-2 pr-10 appearance-none bg-slate-50/50 font-black text-primary"
                          value={installments}
                          onChange={(e) => setInstallments(Number(e.target.value))}
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(i => (
                            <option key={i} value={i}>{i}x de {formatCurrency(subtotal / i)}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end border-b border-border/50 pb-4">
                  <p className="text-xs font-bold text-text-muted uppercase">Total Líquido</p>
                  <p className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(total)}</p>
                </div>

                <button 
                  disabled={cart.length === 0}
                  onClick={handleFinishSale}
                  className="btn-primary w-full py-5 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group"
                >
                  <DollarSign size={24} className="group-hover:rotate-12 transition-transform" />
                  <span className="font-black text-lg tracking-tight">FINALIZAR VENDA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE SUCESSO E IMPRESSÃO */}
      {isSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 print:hidden">
           <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-8 flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center text-white mb-6 animate-in bounce-in duration-500 delay-150 shadow-lg shadow-success/30">
                 <CheckCircle2 size={40} />
               </div>
               
               <h3 className="text-2xl font-black mb-2 tracking-tight">Venda Realizada!</h3>
               <p className="text-sm text-text-muted font-bold leading-relaxed mb-8">
                 O comprovante da venda #{lastSaleId} já está disponível para impressão e download.
               </p>

               <div className="w-full flex flex-col gap-3">
                 <button onClick={() => handlePrint('A4')} className="w-full py-4 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center gap-3 font-black text-text-main transition-all group">
                   <FileText size={20} className="group-hover:translate-y-[-2px] transition-transform" />
                   IMPRIMIR A4 (PDF)
                 </button>
                 
                 <button onClick={() => handlePrint('Coupon')} className="w-full py-4 bg-slate-900 hover:bg-black rounded-2xl flex items-center justify-center gap-3 font-black text-white transition-all group">
                   <Printer size={20} className="group-hover:scale-110 transition-transform" />
                   IMPRIMIR CUPOM
                 </button>

                 <button 
                   onClick={() => setIsSuccess(false)}
                   className="w-full py-4 text-xs font-black text-text-muted hover:text-primary transition-all uppercase tracking-widest mt-2"
                 >
                   Nova Venda
                 </button>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* Cadastro Rápido de Cliente */}
      <CustomerModal 
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={onSaveCustomer}
        mode="create"
      />

      {/* RENDERIZAÇÃO PARA IMPRESSÃO A4 */}
      {printMode === 'A4' && (
        <div className="fixed inset-0 bg-white z-[100] p-12 text-black font-sans leading-relaxed">
           <header className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
             <div className="flex flex-col gap-2">
               <h1 className="text-4xl font-black tracking-tighter">{storeSettings.name}</h1>
               <div className="text-sm font-bold text-slate-600">
                  <p>CNPJ: {storeSettings.cnpj}</p>
                  <p>{storeSettings.address}</p>
                  <p>WhatsApp: {storeSettings.phone1} {storeSettings.phone2 ? `/ ${storeSettings.phone2}` : ''}</p>
                  <p>{storeSettings.email}</p>
               </div>
             </div>
             <div className="text-right flex flex-col gap-1">
               <span className="bg-black text-white px-4 py-1 text-xs font-black uppercase tracking-widest">Recibo de Venda</span>
               <p className="text-sm font-bold mt-2">Nº #{lastSaleId}</p>
               <p className="text-xs text-slate-500 font-bold uppercase">{formatDate(new Date().toISOString())}</p>
             </div>
           </header>

           <section className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-200">
             <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Dados do Cliente</h4>
             <p className="text-xl font-black">{finalPaymentInfo.customer?.name || 'CONSUMIDOR FINAL'}</p>
             {finalPaymentInfo.customer?.cpf && <p className="text-sm font-bold text-slate-600 mt-1">CPF: {finalPaymentInfo.customer.cpf}</p>}
           </section>

           <section className="mb-10">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b-2 border-black">
                   <th className="py-4 text-xs font-black uppercase tracking-widest">Item / Descrição</th>
                   <th className="py-4 text-center text-xs font-black uppercase tracking-widest">Qtd</th>
                   <th className="py-4 text-right text-xs font-black uppercase tracking-widest">Valor Unit.</th>
                   <th className="py-4 text-right text-xs font-black uppercase tracking-widest">Total</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {soldItems.map((item, idx) => (
                   <tr key={idx}>
                     <td className="py-4 font-bold">{item.name}</td>
                     <td className="py-4 text-center font-bold">{item.quantity}</td>
                     <td className="py-4 text-right">{formatCurrency(item.price)}</td>
                     <td className="py-4 text-right font-black">{formatCurrency(item.price * item.quantity)}</td>
                   </tr>
                 ))}
               </tbody>
               <tfoot>
                 <tr className="border-t-2 border-black">
                   <td colSpan={3} className="py-6 text-right font-black uppercase text-sm">Total Geral:</td>
                   <td className="py-6 text-right font-black text-2xl tracking-tighter text-primary">
                     {formatCurrency(soldItems.reduce((acc, i) => acc + (i.price * i.quantity), 0))}
                   </td>
                 </tr>
               </tfoot>
             </table>
           </section>

           <section className="mb-10 grid grid-cols-2 gap-8">
             <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
               <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Pagamento</h4>
               <p className="text-lg font-black text-slate-700">
                 {finalPaymentInfo.method}
                 {finalPaymentInfo.method === 'PIX' && ` (${finalPaymentInfo.pixMethod})`}
                 {finalPaymentInfo.method === 'Crédito' && ` em ${finalPaymentInfo.installments}x`}
               </p>
             </div>
             <div className="flex flex-col justify-end text-right italic text-slate-400 text-xs">
               <p>Obrigado pela preferência!</p>
               <p>Volte sempre.</p>
             </div>
           </section>

           <footer className="mt-auto pt-10 text-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] border-t border-slate-100">
             Via única do cliente • Sistema de Gerenciamento {storeSettings.name}
           </footer>
        </div>
      )}

      {/* RENDERIZAÇÃO PARA IMPRESSÃO CUPOM */}
      {printMode === 'Coupon' && (
        <div className="fixed inset-0 bg-white z-[100] w-[80mm] p-4 text-black font-mono text-xs overflow-visible">
          <div className="text-center border-b border-dashed border-black pb-4 mb-4">
            <h2 className="text-lg font-black">{storeSettings.name}</h2>
            <p className="text-[10px]">{storeSettings.cnpj}</p>
            <p className="text-[10px]">{storeSettings.address}</p>
            <p className="text-[10px]">WhatsApp: {storeSettings.phone1}</p>
            {storeSettings.phone2 && <p className="text-[10px]">WhatsApp: {storeSettings.phone2}</p>}
          </div>

          <div className="mb-4 text-[10px] border-b border-dashed border-black pb-2">
            <p>DATA: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</p>
            <p>PEDIDO: #{lastSaleId}</p>
            <p>CLIENTE: {finalPaymentInfo.customer?.name || 'CONSUMIDOR'}</p>
            {finalPaymentInfo.customer?.phone && <p>FONE: {finalPaymentInfo.customer.phone}</p>}
          </div>

          <div className="mb-4 border-b border-dashed border-black pb-2">
            <div className="flex justify-between font-bold mb-1 border-b border-dotted border-black">
              <span className="w-1/2">ITEM</span>
              <span className="w-1/4 text-center">QTD</span>
              <span className="w-1/4 text-right">TOTAL</span>
            </div>
            {soldItems.map((item, idx) => (
              <div key={idx} className="flex justify-between mb-1 py-1">
                <span className="w-1/2 truncate pr-1">{item.name}</span>
                <span className="w-1/4 text-center">{item.quantity}</span>
                <span className="w-1/4 text-right">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-black text-sm mb-4">
            <span>TOTAL:</span>
            <span>{formatCurrency(soldItems.reduce((acc, i) => acc + (i.price * i.quantity), 0))}</span>
          </div>

          <div className="text-[10px] border-t border-dashed border-black pt-2 mb-4">
            <p>PAGAMENTO: {finalPaymentInfo.method} {finalPaymentInfo.method === 'PIX' ? finalPaymentInfo.pixMethod : ''}</p>
            {finalPaymentInfo.method === 'Crédito' && <p>PARCELAS: {finalPaymentInfo.installments}x</p>}
          </div>

          <div className="text-center mt-6">
            <p className="text-[10px] font-bold">OBRIGADO PELA PREFERÊNCIA!</p>
            <p className="text-[8px] mt-1 italic">{storeSettings.name} - {storeSettings.instagram}</p>
            <p className="text-[7px] mt-4">VIA ÚNICA</p>
          </div>
        </div>
      )}
    </div>
  );
}
