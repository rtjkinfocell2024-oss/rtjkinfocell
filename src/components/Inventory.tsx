import { useState } from 'react';
import { Plus, Search, Filter, Package, AlertTriangle, Edit, Trash2, FileText, Printer } from 'lucide-react';
import { cn, formatCurrency } from '@/src/lib/utils';
import { Product, StoreSettings } from '@/src/types';
import { ProductModal } from './ProductModal';

interface InventoryProps {
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  storeSettings: StoreSettings;
}

export function Inventory({ products, onSaveProduct, onDeleteProduct, storeSettings }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  const handleCreate = () => {
    setSelectedProduct(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const totalCost = products.reduce((acc, p) => acc + (p.cost * p.stock), 0);
  const alertItems = lowStockProducts.length;

  const handlePrintLowStock = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      {/* Print View (Hidden Screen) */}
      <div className="hidden print:block p-8 bg-white text-black">
        <header className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">{storeSettings.name}</h1>
            <p className="text-sm font-bold opacity-70">Relatório de Reposição de Estoque</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase text-slate-500">Data de Emissão</p>
            <p className="font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </header>

        <section className="mb-8">
          <div className="bg-slate-100 p-4 rounded-xl inline-flex flex-col">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total de Itens Críticos</span>
            <span className="text-2xl font-black">{alertItems} Produtos</span>
          </div>
        </section>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="text-left py-3 font-black uppercase text-xs">Produto</th>
              <th className="text-left py-3 font-black uppercase text-xs">Categoria</th>
              <th className="text-center py-3 font-black uppercase text-xs">Qtd. Atual</th>
              <th className="text-center py-3 font-black uppercase text-xs">Mínimo</th>
              <th className="text-right py-3 font-black uppercase text-xs">Preço Custo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lowStockProducts.map(p => (
              <tr key={p.id}>
                <td className="py-4 font-bold">{p.name}</td>
                <td className="py-4">{p.category}</td>
                <td className="py-4 text-center font-black text-red-600">{p.stock}</td>
                <td className="py-4 text-center">{p.minStock}</td>
                <td className="py-4 text-right">{formatCurrency(p.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <footer className="mt-20 pt-8 border-t border-slate-200 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Relatório gerado via {storeSettings.name} Sistema</span>
          <span>Página 1 / 1</span>
        </footer>
      </div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Estoque e Produtos</h2>
          <p className="text-sm text-text-muted">Controle seu inventário e catálogo de serviços.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            disabled={alertItems === 0}
            onClick={handlePrintLowStock}
            className="btn-secondary flex items-center gap-2 border-warning/30 hover:bg-warning/10 text-warning-dark disabled:opacity-50"
          >
            <FileText size={18} />
            Relatório Estoque Baixo
          </button>
          <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Novo Produto
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 print:hidden">
        <div className="card p-5">
          <p className="label">Total em Estoque</p>
          <h3 className="text-2xl font-bold">{totalStock} itens</h3>
        </div>
        <div className="card p-5">
          <p className="label">Valor em Estoque (Custo)</p>
          <h3 className="text-2xl font-bold">{formatCurrency(totalCost)}</h3>
        </div>
        <div className={cn(
          "card p-5 border-warning/50 bg-warning/5",
          alertItems > 0 ? "border-warning/50 bg-warning/5" : "border-border bg-white"
        )}>
          <p className={cn("label", alertItems > 0 && "text-warning")}>Itens em Alerta</p>
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className={cn(alertItems > 0 ? "text-warning" : "text-text-muted")} />
            <h3 className={cn("text-2xl font-bold", alertItems > 0 && "text-warning")}>{alertItems} itens</h3>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou categoria..." 
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="btn-secondary flex items-center gap-2">
              <Filter size={16} />
              Filtrar
            </button>
            <select className="input w-full md:w-[150px]">
              <option>Todas Categorias</option>
              <option>Acessórios</option>
              <option>Peças</option>
              <option>Celular</option>
              <option>Outros</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-text-muted font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Produto</th>
                <th className="px-5 py-3">Categoria</th>
                <th className="px-5 py-3 text-right">Custo</th>
                <th className="px-5 py-3 text-right">Venda</th>
                <th className="px-5 py-3 text-center">Estoque</th>
                <th className="px-5 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleView(product)}>
                  <td className="px-5 py-4 font-medium">{product.name}</td>
                  <td className="px-5 py-4 text-text-muted">{product.category}</td>
                  <td className="px-5 py-4 text-right">{formatCurrency(product.cost)}</td>
                  <td className="px-5 py-4 text-right font-bold text-primary">{formatCurrency(product.price)}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={cn(
                      "font-bold",
                      product.stock <= product.minStock ? "text-danger" : "text-success"
                    )}>
                      {product.stock}
                    </span>
                    <span className="text-[10px] text-text-muted ml-1">/ {product.minStock}</span>
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteProduct(product.id)}
                        className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/5 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveProduct}
        product={selectedProduct}
        mode={modalMode}
      />
    </div>
  );
}
