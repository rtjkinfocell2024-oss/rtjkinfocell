import { useState } from 'react';
import { ShoppingCart, Plus, Trash2, CreditCard, DollarSign, Smartphone, Zap } from 'lucide-react';
import { cn, formatCurrency } from '@/src/lib/utils';
import { Product, SaleItem } from '@/src/types';

const mockProducts: Product[] = [
  { id: '1', name: 'Película de Vidro 3D', category: 'Acessórios', price: 45, cost: 5, stock: 50, minStock: 10 },
  { id: '2', name: 'Cabo Lightning Original', category: 'Acessórios', price: 120, cost: 40, stock: 15, minStock: 5 },
  { id: '3', name: 'Fone Bluetooth Pro', category: 'Acessórios', price: 250, cost: 100, stock: 8, minStock: 3 },
  { id: '4', name: 'Carregador Turbo 20W', category: 'Acessórios', price: 150, cost: 60, stock: 20, minStock: 5 },
];

export function QuickSale() {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const machineFee = paymentMethod === 'Crédito' ? subtotal * 0.035 : paymentMethod === 'Débito' ? subtotal * 0.015 : 0;
  const total = subtotal - machineFee;

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Zap size={18} className="text-primary" />
              Produtos e Serviços
            </h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockProducts.map(product => (
                <button 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left"
                >
                  <div>
                    <p className="font-bold text-sm">{product.name}</p>
                    <p className="text-xs text-text-muted">{product.category} • {product.stock} em estoque</p>
                  </div>
                  <p className="font-bold text-primary">{formatCurrency(product.price)}</p>
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <p className="label mb-3">Serviços Rápidos</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Limpeza Preventiva', price: 80 },
                  { name: 'Aplicação de Película', price: 15 },
                  { name: 'Backup de Dados', price: 100 },
                ].map((service, i) => (
                  <button 
                    key={i}
                    onClick={() => setCart([...cart, { id: `s-${i}`, name: service.name, price: service.price, quantity: 1, type: 'service' }])}
                    className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <p className="font-bold text-sm">{service.name}</p>
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
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <ShoppingCart size={18} />
              Carrinho
            </h3>
            <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full">{cart.length}</span>
          </div>
          <div className="card-content flex flex-col gap-4 min-h-[300px]">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-text-muted opacity-50 py-10">
                <ShoppingCart size={48} className="mb-2" />
                <p className="text-sm">Carrinho vazio</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between group">
                    <div className="flex-1">
                      <p className="text-sm font-bold">{item.name}</p>
                      <p className="text-xs text-text-muted">{item.quantity}x {formatCurrency(item.price)}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto pt-4 border-t border-border flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <p className="label">Forma de Pagamento</p>
                <div className="grid grid-cols-2 gap-2">
                  {['PIX', 'Dinheiro', 'Débito', 'Crédito'].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={cn(
                        "py-2 px-3 rounded-lg text-xs font-bold border transition-all",
                        paymentMethod === method 
                          ? "bg-primary text-white border-primary" 
                          : "bg-white text-text-muted border-border hover:bg-slate-50"
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {machineFee > 0 && (
                  <div className="flex justify-between text-sm text-danger">
                    <span>Taxa Máquina</span>
                    <span>- {formatCurrency(machineFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t border-slate-200">
                  <span>Total Líquido</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <button 
                disabled={cart.length === 0}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Finalizar Venda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
