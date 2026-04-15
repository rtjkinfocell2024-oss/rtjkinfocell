import { useState } from 'react';
import { 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Search, 
  Filter, 
  Download,
  Calendar
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/src/lib/utils';
import { Transaction } from '@/src/types';
import { TransactionModal } from './TransactionModal';

interface FinancialProps {
  transactions: Transaction[];
  onSaveTransaction: (tx: Transaction) => void;
}

export function Financial({ transactions, onSaveTransaction }: FinancialProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const filteredTransactions = transactions.filter(tx => 
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedTx(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleView = (tx: Transaction) => {
    setSelectedTx(tx);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const totalIn = transactions.filter(t => t.type === 'Entrada').reduce((acc, t) => acc + t.value, 0);
  const totalOut = transactions.filter(t => t.type === 'Saída').reduce((acc, t) => acc + t.value, 0);
  const balance = totalIn - totalOut;

  const handleExport = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Valor', 'Tipo'];
    const rows = transactions.map(tx => [
      formatDate(tx.date),
      tx.description,
      tx.category,
      tx.value.toString(),
      tx.type
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financeiro</h2>
          <p className="text-sm text-text-muted">Controle de caixa, entradas e saídas.</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Exportar
          </button>
          <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
            <DollarSign size={18} />
            Nova Transação
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-success/10 text-success rounded-lg">
              <ArrowUpCircle size={20} />
            </div>
            <p className="label mb-0">Total Entradas (Mês)</p>
          </div>
          <h3 className="text-2xl font-bold text-success">{formatCurrency(totalIn)}</h3>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-danger/10 text-danger rounded-lg">
              <ArrowDownCircle size={20} />
            </div>
            <p className="label mb-0">Total Saídas (Mês)</p>
          </div>
          <h3 className="text-2xl font-bold text-danger">{formatCurrency(totalOut)}</h3>
        </div>
        <div className="card p-5 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <DollarSign size={20} />
            </div>
            <p className="label mb-0">Saldo em Caixa</p>
          </div>
          <h3 className="text-2xl font-bold text-primary">{formatCurrency(balance)}</h3>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Fluxo de Caixa</h3>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-text-muted" />
            <span className="text-sm font-medium">Abril, 2024</span>
          </div>
        </div>
        
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Buscar transação..." 
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-text-muted font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Data</th>
                <th className="px-5 py-3">Descrição</th>
                <th className="px-5 py-3">Categoria</th>
                <th className="px-5 py-3 text-right">Valor</th>
                <th className="px-5 py-3 text-center">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleView(tx)}>
                  <td className="px-5 py-4 text-text-muted">{formatDate(tx.date)}</td>
                  <td className="px-5 py-4 font-medium">{tx.description}</td>
                  <td className="px-5 py-4 text-text-muted">{tx.category}</td>
                  <td className={cn(
                    "px-5 py-4 text-right font-bold",
                    tx.type === 'Entrada' ? "text-success" : "text-danger"
                  )}>
                    {tx.type === 'Saída' && '- '}{formatCurrency(tx.value)}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={cn(
                      "badge",
                      tx.type === 'Entrada' ? "badge-success" : "badge-danger"
                    )}>
                      {tx.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveTransaction}
        transaction={selectedTx}
        mode={modalMode}
      />
    </div>
  );
}
