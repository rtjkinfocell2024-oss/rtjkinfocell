import { useState } from 'react';
import { 
  Store, 
  User, 
  Bell, 
  Shield, 
  Smartphone, 
  Printer,
  Save,
  CreditCard,
  Percent,
  Info,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn, formatCurrency } from '@/src/lib/utils';
import { PaymentMachine } from '../types';

interface SettingsProps {
  machines: PaymentMachine[];
  onSaveMachines: (machines: PaymentMachine[]) => void;
}

export function Settings({ machines, onSaveMachines }: SettingsProps) {
  const [activeSection, setActiveSection] = useState('loja');
  const [isSaved, setIsSaved] = useState(false);
  const [localMachines, setLocalMachines] = useState<PaymentMachine[]>(machines);
  const [expandedMachineId, setExpandedMachineId] = useState<string | null>(machines[0]?.id || null);

  const menuItems = [
    { id: 'loja', label: 'Dados da Loja', icon: Store },
    { id: 'taxas', label: 'Taxas de Máquina', icon: CreditCard },
    { id: 'perfil', label: 'Perfil de Usuário', icon: User },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'dispositivos', label: 'Dispositivos', icon: Smartphone },
    { id: 'impressao', label: 'Impressão / Recibos', icon: Printer },
  ];

  const handleSave = () => {
    onSaveMachines(localMachines);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const addMachine = () => {
    const newMachine: PaymentMachine = {
      id: Math.floor(Math.random() * 10000).toString(),
      name: 'Nova Máquina',
      pixFee: 0,
      debitFee: 0,
      creditFees: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0
      }
    };
    setLocalMachines([...localMachines, newMachine]);
    setExpandedMachineId(newMachine.id);
  };

  const removeMachine = (id: string) => {
    setLocalMachines(localMachines.filter(m => m.id !== id));
  };

  const updateMachine = (id: string, field: string, value: any) => {
    setLocalMachines(localMachines.map(m => {
      if (m.id === id) {
        if (field.startsWith('creditFees.')) {
          const installment = parseInt(field.split('.')[1]);
          return {
            ...m,
            creditFees: {
              ...m.creditFees,
              [installment]: value
            }
          };
        }
        return { ...m, [field]: value };
      }
      return m;
    }));
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {isSaved && (
        <div className="bg-success/10 border border-success/20 p-4 rounded-xl flex items-center gap-3 text-success animate-in slide-in-from-top duration-300">
          <CheckCircle2 size={20} />
          <p className="text-sm font-bold">Configurações salvas com sucesso!</p>
        </div>
      )}
      <header className="flex justify-between items-center px-4 md:px-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
          <p className="text-sm text-text-muted">Personalize o sistema para sua loja.</p>
        </div>
        
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save size={18} />
          Salvar Tudo
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-2 px-4 md:px-0">
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left border",
                activeSection === item.id 
                  ? "bg-primary text-white shadow-md shadow-primary/20 border-primary" 
                  : "bg-white text-text-muted hover:bg-slate-50 border-border"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6 px-4 md:px-0">
          {activeSection === 'loja' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Dados da Loja</h3>
                </div>
                <div className="card-content flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="label">Nome Fantasia</label>
                      <input type="text" className="input" defaultValue="RTJK INFOCELL" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="label">Razão Social</label>
                      <input type="text" className="input" defaultValue="RTJK INFOCELL LTDA" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="label">CNPJ</label>
                      <input type="text" className="input" defaultValue="00.000.000/0001-00" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="label">Telefone 1</label>
                      <input type="text" className="input" defaultValue="(11) 99999-9999" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="label">Endereço Completo</label>
                    <input type="text" className="input" defaultValue="Av. Paulista, 1000 - São Paulo, SP" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'taxas' && (
            <div className="flex flex-col gap-6 pb-12">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <CreditCard size={20} className="text-primary" />
                  Gerenciar Máquinas
                </h3>
                <button onClick={addMachine} className="btn-primary py-1.5 text-xs flex items-center gap-2">
                  <Plus size={14} />
                  Adicionar
                </button>
              </div>

              <div className="space-y-4">
                {localMachines.map((machine) => (
                  <div key={machine.id} className="card overflow-hidden">
                    <div 
                      className="card-header cursor-pointer hover:bg-slate-50 flex justify-between items-center"
                      onClick={() => setExpandedMachineId(expandedMachineId === machine.id ? null : machine.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <Smartphone size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{machine.name}</p>
                          <p className="text-[10px] text-text-muted">Personalize as taxas abaixo</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMachine(machine.id);
                          }}
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        {expandedMachineId === machine.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    {expandedMachineId === machine.id && (
                      <div className="card-content border-t border-border bg-white animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-6">
                          <div className="flex flex-col gap-1.5">
                            <label className="label">Nome da Máquina</label>
                            <input 
                              type="text" 
                              className="input" 
                              value={machine.name}
                              onChange={(e) => updateMachine(machine.id, 'name', e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="label">Taxa PIX (%)</label>
                              <div className="relative">
                                <input 
                                  type="number" 
                                  className="input pr-10" 
                                  value={machine.pixFee}
                                  onChange={(e) => updateMachine(machine.id, 'pixFee', Number(e.target.value))}
                                />
                                <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="label">Taxa Débito (%)</label>
                              <div className="relative">
                                <input 
                                  type="number" 
                                  className="input pr-10" 
                                  value={machine.debitFee}
                                  onChange={(e) => updateMachine(machine.id, 'debitFee', Number(e.target.value))}
                                />
                                <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-border">
                            <p className="label mb-4 text-primary font-bold">Taxas de Crédito Parcelado (%)</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((idx) => (
                                <div key={idx} className="flex flex-col gap-1.5">
                                  <label className="label text-[10px] mb-0.5">Crédito {idx}x</label>
                                  <div className="relative">
                                    <input 
                                      type="number" 
                                      className="input pr-7 py-1.5 text-xs bg-slate-50/50" 
                                      value={machine.creditFees[idx] || 0}
                                      onChange={(e) => updateMachine(machine.id, `creditFees.${idx}`, Number(e.target.value))}
                                    />
                                    <Percent size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start">
                <div className="p-1 bg-primary/10 rounded text-primary">
                  <Info size={16} />
                </div>
                <p className="text-xs text-primary leading-relaxed">
                  As taxas configuradas aqui serão aplicadas automaticamente nos módulos de <strong>Venda Rápida</strong> e <strong>Ordens de Serviço</strong> ao selecionar a modalidade de pagamento correspondente.
                </p>
              </div>
            </div>
          )}

          {activeSection !== 'loja' && activeSection !== 'taxas' && (
            <div className="card p-10 flex flex-col items-center justify-center text-text-muted bg-white">
              <h3 className="text-lg font-bold mb-2">Módulo em Desenvolvimento</h3>
              <p className="text-sm">Esta seção de configurações estará disponível em breve.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
