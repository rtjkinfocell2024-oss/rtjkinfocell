import React, { useState } from 'react';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface PriceItem {
  id: string;
  model: string;
  capacity: string;
  price: string;
  oldPrice?: string;
  colors?: string;
  observation: string;
  updatedAt: string;
}

export function PriceTableGenerator() {
  const [items, setItems] = useState<PriceItem[]>([
    {
      id: '1',
      model: 'iPhone 17 Pro Max',
      capacity: '256GB',
      price: '8.350,00',
      observation: 'Branco: 8.650,00',
      updatedAt: new Date().toLocaleDateString('pt-BR')
    },
    {
      id: '2',
      model: 'iPhone 17 Air',
      capacity: '256GB',
      price: '5.895,00',
      observation: '',
      updatedAt: new Date().toLocaleDateString('pt-BR')
    },
    {
      id: '3',
      model: 'iPhone 17e',
      capacity: '256GB',
      price: '3.890,00',
      observation: 'Lançamento',
      updatedAt: new Date().toLocaleDateString('pt-BR')
    },
    {
      id: '4',
      model: 'iPhone 16',
      capacity: '128GB',
      price: '4.490,00',
      observation: '',
      updatedAt: new Date().toLocaleDateString('pt-BR')
    }
  ]);
  const [model, setModel] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [colors, setColors] = useState('');
  const [observation, setObservation] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model || !capacity || !price) return;

    const newItem: PriceItem = {
      id: Math.random().toString(36).substr(2, 9),
      model,
      capacity,
      price,
      oldPrice: oldPrice || undefined,
      colors: colors || undefined,
      observation,
      updatedAt: new Date().toLocaleDateString('pt-BR')
    };

    setItems([...items, newItem]);
    setModel('');
    setCapacity('');
    setPrice('');
    setOldPrice('');
    setColors('');
    setObservation('');
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleCopyToWhatsApp = () => {
    if (items.length === 0) return;

    const today = new Date().toLocaleDateString('pt-BR');
    let text = `📱 RTJK INFOCELL 📱\n`;
    text += `Atualizado ${today}\n`;
    text += `Linha Apple Lacrado\n\n`;

    items.forEach(item => {
      text += `📱 ${item.model}\n`;
      text += `${item.capacity}\n`;
      
      if (item.price === '❌') {
        text += `❌\n`;
      } else {
        const formattedPrice = item.price.includes('R$') ? item.price : `R$ ${item.price}`;
        text += `${formattedPrice}\n`;
      }

      if (item.colors || item.observation) {
        const details = [item.colors, item.observation].filter(Boolean).join(' | ');
        text += `(${details})\n`;
      }
      text += `\n`;
    });

    text += `Esses são valores de A vista / Pix\n`;
    text += `Todos aparelhos lacrados citados acima\n`;
    text += `Consulte nosso parcelado no cartão de crédito 💳\n`;
    text += `Simulamos na HORA.\n`;
    text += `RTJK INFOCELL\n`;
    text += `Estamos a disposição\n`;
    text += `DEUS abençoe a todos 🙏`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Gerador de Tabela para WhatsApp</h2>
        </div>
        <div className="card-content">
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Modelo</label>
              <input 
                type="text" 
                className="input" 
                placeholder="ex: iPhone 17 Pro Max"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Capacidade</label>
              <input 
                type="text" 
                className="input" 
                placeholder="ex: 256GB"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Preço Novo</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Valor ou ❌"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Preço Antigo (Opcional)</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Ex: 8.900,00"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Cores (Opcional)</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Branco, Titânio"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Observação</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="input" 
                  placeholder="ex: Lacrado / Lançamento"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                />
                <button type="submit" className="btn-primary min-w-[120px] flex items-center justify-center gap-2">
                  <Plus size={18} />
                  <span>Adicionar</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="card-title">Itens da Tabela ({items.length})</h2>
          <button 
            onClick={handleCopyToWhatsApp}
            disabled={items.length === 0}
            className={cn(
              "btn-primary bg-green-600 hover:bg-green-700 flex items-center gap-2 py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:grayscale w-full md:w-auto justify-center",
              copied && "bg-green-500"
            )}
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
            <span className="font-black">📋 COPIAR PARA WHATSAPP</span>
          </button>
        </div>
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="px-6 py-3 text-xs font-black text-text-muted uppercase tracking-widest">Modelo / Itens</th>
                  <th className="px-6 py-3 text-xs font-black text-text-muted uppercase tracking-widest text-center">Preços</th>
                  <th className="px-6 py-3 text-xs font-black text-text-muted uppercase tracking-widest text-center">Atualizado</th>
                  <th className="px-6 py-3 text-xs font-black text-text-muted uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-text-muted font-medium italic">
                      Nenhum item adicionado à tabela ainda.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-black text-text-main text-base uppercase tracking-tight">{item.model}</span>
                          <span className="text-primary font-black text-xs tracking-wider">{item.capacity}</span>
                          {(item.colors || item.observation) && (
                            <span className="text-[10px] text-text-muted italic bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-1">
                              {[item.colors, item.observation].filter(Boolean).join(' | ')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-black",
                            item.price === '❌' ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                          )}>
                            {item.price === '❌' ? '❌ INDISPONÍVEL' : item.price.includes('R$') ? item.price : `R$ ${item.price}`}
                          </span>
                          {item.oldPrice && (
                            <span className="text-[10px] text-text-muted line-through font-bold opacity-60 whitespace-nowrap">
                              {item.oldPrice.includes('R$') ? item.oldPrice : `R$ ${item.oldPrice}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          {item.updatedAt}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
