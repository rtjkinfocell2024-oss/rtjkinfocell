import { useState } from 'react';
import { Plus, Search, UserPlus, Phone, Mail, Edit, Trash2, History } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Customer, ServiceOrder, Transaction } from '@/src/types';
import { CustomerModal } from './CustomerModal';
import { CustomerHistoryModal } from './CustomerHistoryModal';

interface CustomersProps {
  customers: Customer[];
  serviceOrders: ServiceOrder[];
  transactions: Transaction[];
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export function Customers({ customers, serviceOrders, transactions, onSaveCustomer, onDeleteCustomer }: CustomersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm) || 
    (c.cpf && c.cpf.includes(searchTerm))
  );

  const handleCreate = () => {
    setSelectedCustomer(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleHistory = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsHistoryOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
          <p className="text-sm text-text-muted">Gerencie sua base de contatos e histórico.</p>
        </div>
        
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <UserPlus size={18} />
          Novo Cliente
        </button>
      </header>

      <div className="card">
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nome, telefone ou CPF..." 
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-text-muted font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">Contato</th>
                <th className="px-5 py-3">CPF</th>
                <th className="px-5 py-3 text-center">OS Ativas</th>
                <th className="px-5 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleView(customer)}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-text-muted font-bold text-xs uppercase">
                        {customer.name.substring(0, 2)}
                      </div>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-text-main">
                        <Phone size={12} className="text-text-muted" />
                        <span>{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-1.5 text-text-muted text-xs">
                          <Mail size={12} />
                          <span>{customer.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-text-muted">{customer.cpf || '---'}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-bold text-primary">
                      {serviceOrders.filter(os => os.customerId === customer.id && os.status !== 'Entregue' && os.status !== 'Cancelado').length}
                    </span>
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleHistory(customer)}
                        className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded-md transition-colors" 
                        title="Histórico"
                      >
                        <History size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(customer)}
                        className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded-md transition-colors" 
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteCustomer(customer.id)}
                        className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/5 rounded-md transition-colors" 
                        title="Excluir"
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

      <CustomerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveCustomer}
        customer={selectedCustomer}
        mode={modalMode}
      />

      <CustomerHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        customer={selectedCustomer}
        serviceOrders={serviceOrders}
        transactions={transactions}
      />
    </div>
  );
}
