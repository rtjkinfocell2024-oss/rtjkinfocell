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
  CheckCircle2
} from 'lucide-react';
import { cn, formatCurrency } from '@/src/lib/utils';

export function Settings() {
  const [activeSection, setActiveSection] = useState('loja');
  const [isSaved, setIsSaved] = useState(false);
  const [fees, setFees] = useState({
    pix: 0,
    debit: 1.5,
    credit1x: 3.5,
    credit6x: 8.9,
    credit12x: 14.5
  });

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
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {isSaved && (
        <div className="bg-success/10 border border-success/20 p-4 rounded-xl flex items-center gap-3 text-success animate-in slide-in-from-top duration-300">
          <CheckCircle2 size={20} />
          <p className="text-sm font-bold">Configurações salvas com sucesso!</p>
        </div>
      )}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
          <p className="text-sm text-text-muted">Personalize o sistema para sua loja.</p>
        </div>
        
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save size={18} />
          Salvar Tudo
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-2">
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

        <div className="lg:col-span-2 flex flex-col gap-6">
          {activeSection === 'loja' && (
            <>
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
                    <div className="flex flex-col gap-1.5">
                      <label className="label">Telefone 2</label>
                      <input type="text" className="input" defaultValue="(11) 98888-8888" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="label">Endereço Completo</label>
                    <input type="text" className="input" defaultValue="Av. Paulista, 1000 - São Paulo, SP" />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="label mb-3">Logotipo da Loja</p>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-slate-100 border-2 border-dashed border-border flex items-center justify-center text-text-muted">
                        <Store size={24} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <button className="btn-secondary py-1.5 px-3 text-xs">Alterar Logo</button>
                        <p className="text-[10px] text-text-muted">PNG ou JPG. Máximo 2MB.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Configurações de Recibo</h3>
                </div>
                <div className="card-content flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="label">Mensagem no Rodapé</label>
                    <textarea 
                      className="input min-h-[100px]" 
                      defaultValue="Obrigado pela preferência! Garantia de 90 dias para serviços realizados."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="print-auto" className="w-4 h-4 text-primary rounded border-border" defaultChecked />
                    <label htmlFor="print-auto" className="text-sm font-medium cursor-pointer">Imprimir recibo automaticamente após venda</label>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === 'taxas' && (
            <div className="flex flex-col gap-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title flex items-center gap-2">
                    <CreditCard size={18} />
                    Configuração de Taxas (%)
                  </h3>
                </div>
                <div className="card-content flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="label">PIX</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          className="input pr-10" 
                          value={fees.pix} 
                          onChange={(e) => setFees({...fees, pix: Number(e.target.value)})}
                        />
                        <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="label">Débito</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          className="input pr-10" 
                          value={fees.debit}
                          onChange={(e) => setFees({...fees, debit: Number(e.target.value)})}
                        />
                        <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="label">Crédito (1x)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          className="input pr-10" 
                          value={fees.credit1x}
                          onChange={(e) => setFees({...fees, credit1x: Number(e.target.value)})}
                        />
                        <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="label">Crédito (6x)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          className="input pr-10" 
                          value={fees.credit6x}
                          onChange={(e) => setFees({...fees, credit6x: Number(e.target.value)})}
                        />
                        <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="label">Crédito (12x)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          className="input pr-10" 
                          value={fees.credit12x}
                          onChange={(e) => setFees({...fees, credit12x: Number(e.target.value)})}
                        />
                        <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start">
                    <div className="p-1 bg-primary/10 rounded text-primary">
                      <Info size={16} />
                    </div>
                    <p className="text-xs text-primary leading-relaxed">
                      Essas taxas são utilizadas nos módulos de <strong>Venda Rápida</strong> e <strong>Ordem de Serviço</strong> para calcular o valor líquido real que entrará no seu caixa após o desconto da operadora.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Simulador de Venda</h3>
                </div>
                <div className="card-content flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="label">Valor da Venda</label>
                    <input type="number" className="input" placeholder="R$ 0,00" defaultValue={1000} />
                  </div>

                  <div className="space-y-3">
                    <p className="label">Resultado por Modalidade</p>
                    {[
                      { label: 'PIX', fee: fees.pix },
                      { label: 'Débito', fee: fees.debit },
                      { label: 'Crédito (1x)', fee: fees.credit1x },
                      { label: 'Crédito (12x)', fee: fees.credit12x },
                    ].map((sim, i) => {
                      const discount = 1000 * (sim.fee / 100);
                      const net = 1000 - discount;
                      return (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-border">
                          <div>
                            <p className="text-sm font-bold">{sim.label}</p>
                            <p className="text-[10px] text-text-muted">Taxa de {sim.fee}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">{formatCurrency(net)}</p>
                            <p className="text-[10px] text-danger">- {formatCurrency(discount)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection !== 'loja' && activeSection !== 'taxas' && (
            <div className="card p-10 flex flex-col items-center justify-center text-text-muted">
              <h3 className="text-lg font-bold mb-2">Módulo em Desenvolvimento</h3>
              <p className="text-sm">Esta seção de configurações estará disponível em breve.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
