import { useState, useEffect, FormEvent } from 'react';
import { X, Save, User, Phone, Mail, CreditCard, MapPin } from 'lucide-react';
import { Customer } from '@/src/types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  customer?: Customer | null;
  mode: 'create' | 'edit' | 'view';
}

export function CustomerModal({ isOpen, onClose, onSave, customer, mode }: CustomerModalProps) {
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    cpf: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        cpf: '',
      });
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isView) return;

    const newCustomer: Customer = {
      id: customer?.id || Math.floor(Math.random() * 10000).toString(),
      name: formData.name || '',
      phone: formData.phone || '',
      email: formData.email || '',
      cpf: formData.cpf || '',
    };

    onSave(newCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        <header className="px-6 py-4 border-b border-border flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold">
              {mode === 'create' ? 'Novo Cliente' : mode === 'edit' ? `Editar Cliente` : `Visualizar Cliente`}
            </h3>
            <p className="text-xs text-text-muted">Cadastre ou edite informações de contato do cliente.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="label">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="text" 
                className="input pl-10" 
                placeholder="Ex: João Silva"
                required
                disabled={isView}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="label">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="text" 
                  className="input pl-10" 
                  placeholder="(00) 00000-0000"
                  required
                  disabled={isView}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label">CPF</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="text" 
                  className="input pl-10" 
                  placeholder="000.000.000-00"
                  disabled={isView}
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="email" 
                className="input pl-10" 
                placeholder="cliente@email.com"
                disabled={isView}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label">Endereço (Opcional)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="text" 
                className="input pl-10" 
                placeholder="Rua, Número, Bairro, Cidade"
                disabled={isView}
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
              Salvar Cliente
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
