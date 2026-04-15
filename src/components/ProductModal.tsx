import { useState, useEffect, FormEvent } from 'react';
import { X, Save, Package, Tag, DollarSign, BarChart, Info, Truck, Barcode, Layers } from 'lucide-react';
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
    brand: '',
    model: '',
    description: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    supplier: '',
    barcode: '',
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        category: 'Acessórios',
        brand: '',
        model: '',
        description: '',
        price: 0,
        cost: 0,
        stock: 0,
        minStock: 5,
        supplier: '',
        barcode: '',
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
      category: formData.category as Product['category'] || 'Acessórios',
      brand: formData.brand || '',
      model: formData.model || '',
      description: formData.description || '',
      price: formData.price || 0,
      cost: formData.cost || 0,
      stock: formData.stock || 0,
      minStock: formData.minStock || 0,
      supplier: formData.supplier || '',
      barcode: formData.barcode || '',
    };

    onSave(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome do Produto */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="label">Nome do Produto *</label>
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

            {/* Categoria */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Categoria *</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <select 
                  className="input pl-10"
                  required
                  disabled={isView}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Product['category'] })}
                >
                  <option value="">Selecione...</option>
                  <option value="Acessórios">Acessórios</option>
                  <option value="Peças">Peças</option>
                  <option value="Celular">Celular</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </div>

            {/* Marca */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Marca</label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="text" 
                  className="input pl-10" 
                  placeholder="Ex: Apple, Samsung"
                  disabled={isView}
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            </div>

            {/* Modelo */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Modelo</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Ex: iPhone 13 Pro"
                disabled={isView}
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>

            {/* Código de Barras */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Código de Barras</label>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="text" 
                  className="input pl-10" 
                  placeholder="EAN-13"
                  disabled={isView}
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="label">Descrição</label>
              <div className="relative">
                <Info className="absolute left-3 top-3 text-text-muted" size={16} />
                <textarea 
                  className="input pl-10 py-2 min-h-[80px]" 
                  placeholder="Detalhes do produto..."
                  disabled={isView}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Preço de Custo */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Preço de Custo (R$)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="number" 
                  className="input pl-10" 
                  placeholder="0,00"
                  disabled={isView}
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Preço de Venda */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Preço de Venda * (R$)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="number" 
                  className="input pl-10" 
                  placeholder="0,00"
                  required
                  disabled={isView}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Quantidade em Estoque */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Quantidade em Estoque *</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="number" 
                  className="input pl-10" 
                  placeholder="0"
                  required
                  disabled={isView}
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Estoque Mínimo */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Estoque Mínimo *</label>
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

            {/* Fornecedor */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="label">Fornecedor</label>
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <select 
                  className="input pl-10"
                  disabled={isView}
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  <option value="Fornecedor A">Fornecedor A</option>
                  <option value="Fornecedor B">Fornecedor B</option>
                  <option value="Distribuidora X">Distribuidora X</option>
                </select>
              </div>
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
