import { useState } from 'react';
import { ShoppingCart, Plus, Trash2, CreditCard, DollarSign, Smartphone, Zap, CheckCircle2, User, ChevronDown } from 'lucide-react';
import { cn, formatCurrency } from '@/src/lib/utils';
import { Product, SaleItem, Transaction, Customer, PaymentMachine } from '@/src/types';

interface QuickSaleProps {
  products: Product[];
  customers: Customer[];
  machines: PaymentMachine[];
  onSaveTransaction: (tx: Transaction) => void;
}

export function QuickSale({ products, customers, machines, onSaveTransaction }: QuickSaleProps) {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedMachineId, setSelectedMachineId] = useState(machines[0]?.id || '');
  const [installments, setInstallments] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const selectedMachine = machines.find(m => m.id === selectedMachineId);
  
  let feePercentage = 0;
  if (paymentMethod === 'PIX') feePercentage = selectedMachine?.pixFee || 0;
  else if (paymentMethod === 'Débito') feePercentage = selectedMachine?.debitFee || 0;
  else if (paymentMethod === 'Crédito') feePercentage = selectedMachine?.creditFees[installments] || 0;
  
  const machineFee = subtotal * (feePercentage / 100);
  const total = subtotal - machineFee;

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, quantity: 1, type: 'product' }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleFinishSale = () => {
    if (cart.length === 0) return;

    const customerInfo = selectedCustomer ? ` - Cliente: ${selectedCustomer.name}` : '';
    const paymentInfo = paymentMethod === 'Crédito' ? ` (${installments}x)` : '';
    
    const newTransaction: Transaction = {
      id: Math.floor(Math.random() * 10000).toString(),
      type: 'Entrada',
      category: 'Venda',
      description: `Venda PDV: ${cart.map(i => i.name).join(', ')}${customerInfo}${paymentInfo}`,
      value: total,
      date: new Date().toISOString(),
      machineId: selectedMachineId,
      installments: paymentMethod === 'Crédito' ? installments : 1
    };

    onSaveTransaction(newTransaction);
    setIsSuccess(true);
    setCart([]);
    setSelectedCustomerId('');
    setInstallments(1);
    
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 pb-20 lg:pb-0">
      <div className="lg:col-span-2 flex flex-col gap-6">
        {isSuccess && (
          <div className="bg-success/10 border border-success/20 p-4 rounded-xl flex items-center gap-3 text-success animate-in slide-in-from-top duration-300">
            <CheckCircle2 size={20} />
            <p className="text-sm font-bold">Venda finalizada com sucesso! O valor foi lançado no financeiro.</p>
          </div>
        )}

        <div className="card">
          <div className="card-header flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="card-title flex items-center gap-2">
              <Zap size={18} className="text-primary" />
              Produtos e Serviços
            </h3>
            
            <div className="flex items-center gap-2 min-w-full md:min-w-[250px]">
              <User size={16} className="text-text-muted" />
              <select 
                className="input text-xs py-1.5"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">Selecione o cliente (opcional)...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.filter(p => p.category !== 'Peças').map(product => (
                <button 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div>
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{product.name}</p>
                    <p className="text-[10px] text-text-muted uppercase font-semibold">{product.category} • {product.stock} em estoque</p>
                  </div>
                  <p className="font-bold text-primary">{formatCurrency(product.price)}</p>
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <p className="label mb-3">Serviços Rápidos</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 's-1', name: 'Limpeza Preventiva', price: 80 },
                  { id: 's-2', name: 'Aplicação de Película', price: 15 },
                  { id: 's-3', name: 'Backup de Dados', price: 100 },
                ].map((service) => (
                  <button 
                    key={service.id}
                    onClick={() => setCart([...cart, { id: service.id, name: service.name, price: service.price, quantity: 1, type: 'service' }])}
                    className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{service.name}</p>
                    <p className="font-bold text-primary">{formatCurrency(service.price)}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="card sticky top-6">
          <div className="card-header border-b border-border bg-slate-50/50">
            <h3 className="card-title flex items-center gap-2">
              <ShoppingCart size={18} className="text-primary" />
              Carrinho
            </h3>
            <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">{cart.length} ITENS</span>
          </div>
          <div className="card-content flex flex-col gap-4 min-h-[300px]">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-text-muted opacity-30 py-10">
                <ShoppingCart size={48} className="mb-2" />
                <p className="text-sm font-medium">Carrinho vazio</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between group bg-slate-50/50 p-2 rounded-lg border border-transparent hover:border-border transition-all">
                    <div className="flex-1">
                      <p className="text-sm font-bold truncate pr-2">{item.name}</p>
                      <p className="text-[10px] text-text-muted font-bold text-primary">{item.quantity}x {formatCurrency(item.price)}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto pt-4 border-t border-border flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="label text-[10px]">Forma de Pagamento</p>
                <div className="grid grid-cols-2 gap-2">
                  {['PIX', 'Dinheiro', 'Débito', 'Crédito'].map(method => (
                    <button
                      key={method}
                      onClick={() => {
                        setPaymentMethod(method);
                        if (method !== 'Crédito') setInstallments(1);
                      }}
                      className={cn(
                        "py-2.5 px-3 rounded-xl text-[11px] font-bold border transition-all shadow-sm",
                        paymentMethod === method 
                          ? "bg-primary text-white border-primary ring-2 ring-primary/20" 
                          : "bg-white text-text-muted border-border hover:bg-slate-50"
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Machine and Installment Selection */}
              {['PIX', 'Débito', 'Crédito'].includes(paymentMethod) && (
                <div className="flex flex-col gap-3 p-3 bg-slate-50 rounded-xl border border-border animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col gap-1.5">
                    <label className="label text-[10px]">Maquininha</label>
                    <div className="relative">
                      <select 
                        className="input text-xs py-1.5 pr-8 appearance-none bg-white"
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
                          className="input text-xs py-1.5 pr-8 appearance-none bg-white font-bold"
                          value={installments}
                          onChange={(e) => setInstallments(Number(e.target.value))}
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(i => (
                            <option key={i} value={i}>{i}x de {formatCurrency(subtotal / i)}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-slate-900 p-4 rounded-xl flex flex-col gap-2 shadow-inner">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
                </div>
                {machineFee > 0 && (
                  <div className="flex justify-between text-[11px] text-danger font-medium">
                    <span>Taxa Maquina ({feePercentage}%)</span>
                    <span>- {formatCurrency(machineFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-success pt-2 border-t border-white/10 mt-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider leading-none mb-1">Total Líquido</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <button 
                disabled={cart.length === 0}
                onClick={handleFinishSale}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 group"
              >
                <DollarSign size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="font-bold text-base">Finalizar Venda</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
