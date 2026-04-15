import { useState } from 'react';
import { Plus, Search, Filter, Package, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { cn, formatCurrency } from '@/src/lib/utils';
import { Product } from '@/src/types';

const mockProducts: Product[] = [
  { id: '1', name: 'Película de Vidro 3D', category: 'Acessórios', price: 45, cost: 5, stock: 50, minStock: 10 },
  { id: '2', name: 'Cabo Lightning Original', category: 'Acessórios', price: 120, cost: 40, stock: 15, minStock: 5 },
  { id: '3', name: 'Fone Bluetooth Pro', category: 'Acessórios', price: 250, cost: 100, stock: 2, minStock: 3 },
  { id: '4', name: 'Carregador Turbo 20W', category: 'Acessórios', price: 150, cost: 60, stock: 20, minStock: 5 },
  { id: '5', name: 'Tela iPhone 13 Pro', category: 'Peças', price: 850, cost: 450, stock: 3, minStock: 2 },
  { id: '6', name: 'Bateria Samsung S22', category: 'Peças', price: 180, cost: 60, stock: 1, minStock: 2 },
];

export function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Estoque e Produtos</h2>
          <p className="text-sm text-text-muted">Controle seu inventário e catálogo de serviços.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Package size={18} />
            Categorias
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Novo Produto
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-5">
          <p className="label">Total em Estoque</p>
          <h3 className="text-2xl font-bold">91 itens</h3>
        </div>
        <div className="card p-5">
          <p className="label">Valor em Estoque (Custo)</p>
          <h3 className="text-2xl font-bold">{formatCurrency(2450.00)}</h3>
        </div>
        <div className="card p-5 border-warning/50 bg-warning/5">
          <p className="label text-warning">Itens em Alerta</p>
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-warning" />
            <h3 className="text-2xl font-bold text-warning">2 itens</h3>
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
              <option>Aparelhos</option>
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
              {mockProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
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
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded-md transition-colors">
                        <Edit size={16} />
                      </button>
                      <button className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/5 rounded-md transition-colors">
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
    </div>
  );
}
