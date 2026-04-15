import { useState, useEffect, FormEvent } from 'react';
import { X, Save, DollarSign, Tag, FileText, Calendar, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Transaction } from '@/src/types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction) => void;
  transaction?: Transaction | null;
  mode: 'create' | 'edit' | 'view';
}

export function TransactionModal({ isOpen, onClose, onSave, transaction, mode }: TransactionModalProps) {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'Entrada',
    category: 'Venda',
    description: '',
    value: 0,
    date: new Date().toISOString(),
  });

  useEffect(() => {
    if (transaction) {
      setFormData(transaction);
    } else {
      setFormData({
        type: 'Entrada',
        category: 'Venda',
        description: '',
        value: 0,
        date: new Date().toISOString(),
      });
    }
  }, [transaction, isOpen]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isView) return;

    const newTx: Transaction = {
      id: transaction?.id || Math.floor(Math.random() * 10000).toString(),
      type: formData.type as 'Entrada' | 'Saída' || 'Entrada',
      category: formData.category || 'Venda',
      description: formData.description || '',
      value: formData.value || 0,
      date: formData.date || new Date().toISOString(),
    };

    onSave(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        <header className="px-6 py-4 border-b border-border flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold">
              {mode === 'create' ? 'Nova Transação' : mode === 'edit' ? `Editar Transação` : `Visualizar Transação`}
            </h3>
            <p className="text-xs text-text-muted">Registre entradas ou saídas do seu caixa.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col gap-3">
            <label className="label">Tipo de Lançamento</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'Entrada' })}
                disabled={isView}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold ${
                  formData.type === 'Entrada' 
                    ? 'border-success bg-success/5 text-success' 
                    : 'border-border text-text-muted hover:bg-slate-50'
                }`}
              >
                <ArrowUpCircle size={20} />
                Entrada
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'Saída' })}
                disabled={isView}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold ${
                  formData.type === 'Saída' 
                    ? 'border-danger bg-danger/5 text-danger' 
                    : 'border-border text-text-muted hover:bg-slate-50'
                }`}
              >
                <ArrowDownCircle size={20} />
                Saída
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label">Descrição</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="text" 
                className="input pl-10" 
                placeholder="Ex: Pagamento de Fornecedor"
                required
                disabled={isView}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="label">Valor (R$)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="number" 
                  className="input pl-10 font-bold" 
                  placeholder="0,00"
                  required
                  disabled={isView}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                />
              </div>
            </div>
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
                  <option value="Venda">Venda</option>
                  <option value="Serviço">Serviço</option>
                  <option value="Fornecedor">Fornecedor</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Salário">Salário</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label">Data do Lançamento</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="datetime-local" 
                className="input pl-10" 
                required
                disabled={isView}
                value={formData.date?.substring(0, 16)}
                onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value).toISOString() })}
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
              Salvar Lançamento
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
