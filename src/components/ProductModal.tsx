import { useState, useEffect, FormEvent } from 'react';
import { X, Save, Package, Tag, DollarSign, BarChart } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Product } from '@/src/types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product?: Product | null;
  mode: 'create' | 'edit' | 'view';
}

export function ProductModal({ isOpen, onClose, onSave, product, mode }: ProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Acessórios',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        category: 'Acessórios',
        price: 0,
        cost: 0,
        stock: 0,
        minStock: 5,
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isView) return;

    const newProduct: Product = {
      id: product?.id || Math.floor(Math.random() * 10000).toString(),
      name: formData.name || '',
      category: formData.category || 'Acessórios',
      price: formData.price || 0,
      cost: formData.cost || 0,
      stock: formData.stock || 0,
      minStock: formData.minStock || 0,
    };

    onSave(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        <header className="px-6 py-4 border-b border-border flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold">
              {mode === 'create' ? 'Novo Produto' : mode === 'edit' ? `Editar Produto` : `Visualizar Produto`}
            </h3>
            <p className="text-xs text-text-muted">Gerencie as informações do seu inventário.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="label">Nome do Produto</label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="text" 
                className="input pl-10" 
                placeholder="Ex: Película de Vidro 3D"
                required
                disabled={isView}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="label">Categoria</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <select 
                  className="input pl-10"
                  disabled={isView}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Acessórios">Acessórios</option>
                  <option value="Peças">Peças</option>
                  <option value="Aparelhos">Aparelhos</option>
                  <option value="Serviços">Serviços</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label">Estoque Mínimo</label>
              <div className="relative">
                <BarChart className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="number" 
                  className="input pl-10" 
                  placeholder="5"
                  required
                  disabled={isView}
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="label">Custo (R$)</label>
              <input 
                type="number" 
                className="input" 
                placeholder="0,00"
                required
                disabled={isView}
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label">Venda (R$)</label>
              <input 
                type="number" 
                className="input" 
                placeholder="0,00"
                required
                disabled={isView}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label">Estoque Atual</label>
              <input 
                type="number" 
                className="input" 
                placeholder="0"
                required
                disabled={isView}
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              />
            </div>
          </div>
        </form>

        <footer className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-slate-50">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          {!isView && (
            <button type="submit" onClick={handleSubmit} className="btn-primary flex items-center gap-2">
              <Save size={18} />
              Salvar Produto
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
