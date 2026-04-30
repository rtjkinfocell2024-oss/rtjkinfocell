import React, { useState } from 'react';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface PriceItem {
  id: string;
  model: string;
  capacity: string;
  price: string;
  observation: string;
}

export function PriceTableGenerator() {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [model, setModel] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
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
      observation
    };

    setItems([...items, newItem]);
    setModel('');
    setCapacity('');
    setPrice('');
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
        // Basic check to see if it's already formatted or just a number
        const formattedPrice = item.price.includes('R$') ? item.price : `R$ ${item.price}`;
        text += `${formattedPrice}\n`;
      }

      if (item.observation) {
        text += `(${item.observation})\n`;
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
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
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
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Preço</label>
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
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Observação</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="input" 
                  placeholder="ex: Branco / Lançamento"
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
        <div className="card-header flex justify-between items-center">
          <h2 className="card-title">Itens da Tabela ({items.length})</h2>
          <button 
            onClick={handleCopyToWhatsApp}
            disabled={items.length === 0}
            className={cn(
              "btn-primary bg-green-600 hover:bg-green-700 flex items-center gap-2 py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:grayscale",
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
                  <th className="px-6 py-3 text-xs font-black text-text-muted uppercase tracking-widest">Modelo</th>
                  <th className="px-6 py-3 text-xs font-black text-text-muted uppercase tracking-widest">Capacidade</th>
                  <th className="px-6 py-3 text-xs font-black text-text-muted uppercase tracking-widest text-center">Preço</th>
                  <th className="px-6 py-3 text-xs font-black text-text-muted uppercase tracking-widest">Observação</th>
                  <th className="px-6 py-3 text-xs font-black text-text-muted uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-muted font-medium italic">
                      Nenhum item adicionado à tabela ainda.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-text-main">{item.model}</td>
                      <td className="px-6 py-4 font-bold text-primary">{item.capacity}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-black",
                          item.price === '❌' ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                        )}>
                          {item.price === '❌' ? '❌ INDISPONÍVEL' : item.price.includes('R$') ? item.price : `R$ ${item.price}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-muted italic">
                        {item.observation || '-'}
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
