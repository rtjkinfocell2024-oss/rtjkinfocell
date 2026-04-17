import { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Search,
  Printer,
  FileText,
  ShieldCheck,
  FileCheck,
  Cpu,
  Database
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/src/lib/utils';
import { Product, Transaction, Customer, PaymentMachine, DetailedSale, StoreSettings } from '@/src/types';
import { CustomerModal } from './CustomerModal';
import { CompleteSaleModal } from './CompleteSaleModal';

interface CompleteSaleProps {
  products: Product[];
  customers: Customer[];
  machines: PaymentMachine[];
  detailedSales: DetailedSale[];
  onSaveTransaction: (tx: Transaction) => void;
  onSaveCustomer: (customer: Customer) => void;
  onSaveDetailedSale: (sale: DetailedSale) => void;
  storeSettings: StoreSettings;
}

export function CompleteSale({ 
  products, 
  customers, 
  machines, 
  detailedSales,
  onSaveTransaction, 
  onSaveCustomer,
  onSaveDetailedSale,
  storeSettings
}: CompleteSaleProps) {
  const [editingSale, setEditingSale] = useState<DetailedSale | null>(null);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSaleId, setLastSaleId] = useState('');
  const [printMode, setPrintMode] = useState<boolean>(false);
  const [finalSale, setFinalSale] = useState<DetailedSale | null>(null);

  const handleEdit = (sale: DetailedSale) => {
    setEditingSale(sale);
    setIsSaleModalOpen(true);
  };

  const handleFinishSale = (saleRecord: DetailedSale) => {
    onSaveDetailedSale(saleRecord);
    setFinalSale(saleRecord);
    setLastSaleId(saleRecord.id);
    setIsSuccess(true);
  };

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 200);
  };

  const handleView = (sale: DetailedSale) => {
    setFinalSale(sale);
    setLastSaleId(sale.id);
    handlePrint();
  };

  const resetForm = () => {
    setIsSuccess(false);
    setEditingSale(null);
    setIsSaleModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-24 lg:pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Vendas de Aparelhos</h2>
          <p className="text-sm text-text-muted font-medium">Histórico de vendas completas realizadas</p>
        </div>
        <button 
          onClick={() => {
            setEditingSale(null);
            setIsSaleModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2 h-12 px-6 rounded-2xl shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Nova Venda
        </button>
      </div>

      <div className="card h-[600px]">
          <div className="card-header bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <h3 className="card-title">Vendas Recentes</h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
              <input type="text" placeholder="Buscar por cliente ou IMEI..." className="input pl-9 text-xs" />
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            {detailedSales.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40">
                <FileText size={64} className="mb-4 text-text-muted" />
                <p className="text-lg font-bold">Nenhuma venda registrada</p>
                <p className="text-sm">Clique em "Nova Venda" para começar.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white border-b border-border z-10">
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Aparelho / Cliente</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Data</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Valor</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {detailedSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{sale.items[0]?.name} {sale.model}</span>
                          <span className="text-xs text-text-muted uppercase font-bold tracking-tight">
                            {sale.customerName} • IMEI: {sale.imei || 'N/A'} {sale.imei2 ? `/ ${sale.imei2}` : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-text-muted">{formatDate(sale.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-sm">{formatCurrency(sale.total)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "badge",
                          sale.status === 'Finalizada' ? "badge-success" : "badge-danger"
                        )}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleView(sale)}
                            className="p-2 hover:bg-white rounded-lg text-text-muted hover:text-primary transition-all shadow-sm border border-transparent hover:border-border"
                            title="Visualizar Recibo"
                          >
                            <Printer size={16} />
                          </button>
                          <button 
                            onClick={() => handleEdit(sale)}
                            className="p-2 hover:bg-white rounded-lg text-text-muted hover:text-primary transition-all shadow-sm border border-transparent hover:border-border"
                            title="Editar Venda"
                          >
                            <FileCheck size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RENDERIZAÇÃO PROFISSIONAL PARA IMPRESSÃO A4 */}
        {printMode && finalSale && (
          <div className="fixed inset-0 bg-white z-[100] p-0 text-black font-sans print-only overflow-hidden a4-container" style={{ display: 'none' }}>
             <div className="a4-content">
                {/* Cabeçalho Profissional - PADRÃO ÚNICO */}
                <header className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
                   <div className="flex items-center gap-4">
                      {storeSettings.logoUrl ? (
                        <img src={storeSettings.logoUrl} alt="Logo" className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xl">
                           {storeSettings.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                         <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">{storeSettings.name}</h1>
                         <div className="text-[9px] font-bold text-slate-600 space-y-0 mt-0.5 leading-tight">
                            <p>{storeSettings.corporateName}</p>
                            <p>CNPJ: {storeSettings.cnpj} | {storeSettings.address}</p>
                            <p>Fone: {storeSettings.phone1} {storeSettings.phone2 ? ` / ${storeSettings.phone2}` : ''}</p>
                         </div>
                      </div>
                   </div>
                   <div className="text-right flex flex-col items-end">
                      <div className="bg-slate-900 text-white px-6 py-2 rounded-bl-2xl">
                         <p className="text-[8px] font-black uppercase tracking-widest opacity-80">Recibo de Venda</p>
                         <h2 className="text-2xl font-black">#{finalSale.id}</h2>
                      </div>
                      <p className="text-[8px] font-bold mt-1 text-slate-500 uppercase tracking-widest italic">Venda de Equipamento</p>
                      <p className="text-[10px] font-black mt-0.5 uppercase italic">{formatDate(finalSale.createdAt)}</p>
                   </div>
                </header>

                <div className="space-y-4 flex-1">
                   {/* 1. SEÇÃO COMPRADOR E EQUIPAMENTO */}
                   <div className="grid grid-cols-2 gap-3">
                      <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                         <h3 className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Dados do Comprador</h3>
                         <p className="text-base font-black text-slate-900 uppercase leading-none mb-2">{finalSale.customerName}</p>
                         <div className="grid grid-cols-2 gap-y-1 text-[10px] font-bold text-slate-700">
                            <div>
                               <span className="text-[7px] uppercase text-slate-400 block">CPF/CNPJ</span>
                               {customers.find(c => c.id === finalSale.customerId)?.cpf || 'N/A'}
                            </div>
                            <div>
                               <span className="text-[7px] uppercase text-slate-400 block">Telefone</span>
                               {customers.find(c => c.id === finalSale.customerId)?.phone || 'N/A'}
                            </div>
                            <div className="col-span-2">
                               <span className="text-[7px] uppercase text-slate-400 block font-black">Endereço</span>
                               <span className="line-clamp-1">{customers.find(c => c.id === finalSale.customerId)?.address || 'N/A'}</span>
                            </div>
                         </div>
                      </div>
                      <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                         <h3 className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Especificações do Aparelho</h3>
                         <p className="text-base font-black text-slate-900 uppercase leading-none mb-2">{finalSale.items[0]?.name} {finalSale.model}</p>
                         <div className="grid grid-cols-2 gap-y-1 text-[10px] font-bold text-slate-700">
                            <div>
                               <span className="text-[7px] uppercase text-slate-400 block">IMEI / SN</span>
                               <span className="truncate block">{finalSale.imei || 'N/A'}</span>
                            </div>
                            <div>
                               <span className="text-[7px] uppercase text-slate-400 block">Cor / Detalhes</span>
                               {finalSale.color || 'N/A'} / {finalSale.storage || '--'}
                            </div>
                            <div className="col-span-2">
                               <span className="text-[7px] uppercase text-slate-400 block font-black text-slate-900">Garantia Loja</span>
                               <span className="italic">{finalSale.warranty}</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* 2. DESCRIÇÃO DA VENDA */}
                   <div className="border-l-4 border-slate-900 bg-slate-100/50 p-3">
                      <h3 className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Itens Adicionais e Descritivo</h3>
                      <p className="text-[11px] font-bold text-slate-800 italic leading-snug">
                         Venda de aparelho celular conforme especificações acima discriminadas, acompanhando acessórios básicos conforme acordado.
                      </p>
                   </div>

                   {/* 3. LISTAGEM DE VALORES */}
                   <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="bg-slate-900 text-white">
                               <th className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest">Item / Serviço</th>
                               <th className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-center">Quant</th>
                               <th className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-right">Unitário</th>
                               <th className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-right">Subtotal</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 text-[10px] font-bold">
                            {finalSale.items.map(item => (
                              <tr key={item.id}>
                                <td className="px-3 py-3 text-slate-800">{item.name}</td>
                                <td className="px-3 py-3 text-center text-slate-600">1</td>
                                <td className="px-3 py-3 text-right text-slate-600">{formatCurrency(item.price)}</td>
                                <td className="px-3 py-3 text-right text-slate-900">{formatCurrency(item.price)}</td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>

                   {/* 4. GARANTIA E OBSERVACÕES */}
                   <div className="grid grid-cols-2 gap-3">
                      <div className="border border-slate-200 p-3 rounded-lg">
                         <h4 className="text-[8px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">Termos de Venda e Uso</h4>
                         <div className="text-[9px] font-bold text-slate-600 leading-tight space-y-0.5">
                            <p>• O cliente declara ter testado e aprovado o aparelho no ato da compra.</p>
                            <p>• A garantia de {finalSale.warranty} é restrita a hardware interno.</p>
                            <p>• Quebras de tela, carcaça ou danos por líquido invalidam o termo.</p>
                         </div>
                      </div>
                      <div className="border border-slate-200 p-3 rounded-lg">
                         <h4 className="text-[8px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">Observações Gerais</h4>
                         <p className="text-[9px] font-bold text-slate-600 leading-tight italic line-clamp-3">
                            {finalSale.observations || "Nenhuma observação adicional registrada para esta venda."}
                         </p>
                      </div>
                   </div>
                </div>

                {/* 5. FINANCEIRO E ASSINATURAS */}
                <div className="mt-4 pt-4 border-t-2 border-slate-900">
                   <div className="grid grid-cols-3 gap-6 items-end">
                      <div className="col-span-2 flex flex-col gap-8">
                         <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col items-center">
                               <div className="w-full h-px bg-slate-900"></div>
                               <p className="text-[7px] font-black uppercase mt-1">Assinatura do Comprador</p>
                            </div>
                             <div className="flex flex-col items-center">
                               <div className="w-full h-px bg-slate-900"></div>
                               <p className="text-[7px] font-black uppercase mt-1">Vendedor / {storeSettings.name}</p>
                            </div>
                         </div>
                         <footer className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                            RECIBO EMITIDO EM {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                         </footer>
                      </div>
                      
                      <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col justify-between">
                         <div className="space-y-1 mb-2">
                            <div className="flex justify-between items-center text-[8px] font-bold opacity-70 uppercase">
                               <span>Subtotal</span>
                               <span>{formatCurrency(finalSale.subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[8px] font-bold opacity-70 uppercase">
                               <span>Desconto</span>
                               <span>{formatCurrency(finalSale.discount || 0)}</span>
                            </div>
                            <div className="h-px bg-white/10"></div>
                            <div className="flex justify-between items-end">
                               <span className="text-[8px] uppercase font-black tracking-widest">Total Geral</span>
                               <span className="text-xl font-black">{formatCurrency(finalSale.total)}</span>
                            </div>
                         </div>
                         <div className="border-t border-white/10 pt-2 text-[8px] font-bold">
                            <p className="uppercase text-white/40 tracking-widest">Pagamento: <span className="text-white opacity-100">{finalSale.paymentMethod} {finalSale.paymentMethod === 'Crédito' ? `(${finalSale.installments}x)` : ''}</span></p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      <CompleteSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSave={handleFinishSale}
        onSaveTransaction={onSaveTransaction}
        sale={editingSale}
        mode={editingSale ? 'edit' : 'create'}
        customers={customers}
        machines={machines}
        onQuickAddCustomer={() => setIsCustomerModalOpen(true)}
      />

      {/* Success Modal */}
      {isSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 print:hidden">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 text-center animate-in zoom-in-95 duration-300">
             <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-500/30">
               <ShieldCheck size={40} />
             </div>
             <h3 className="text-2xl font-black mb-2">Aparelho Vendido!</h3>
             <p className="text-sm text-text-muted mb-8 italic">Venda #{lastSaleId} registrada no financeiro.</p>
             
             <div className="space-y-3">
               <button onClick={handlePrint} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3">
                 <Printer size={20} />
                 IMPRIMIR RECIBO A4
               </button>
               <button onClick={resetForm} className="w-full py-4 text-xs font-black text-text-muted uppercase tracking-widest">
                 Voltar para Lista
               </button>
             </div>
          </div>
        </div>
      )}


      {/* Cadastro Rápido de Cliente */}
      <CustomerModal 
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={onSaveCustomer}
        mode="create"
      />
    </div>
  );
}
