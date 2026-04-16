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
import { Product, Transaction, Customer, PaymentMachine, DetailedSale } from '@/src/types';
import { CustomerModal } from './CustomerModal';
import { CompleteSaleModal } from './CompleteSaleModal';
import { COMPANY_INFO } from '@/src/constants';

interface CompleteSaleProps {
  products: Product[];
  customers: Customer[];
  machines: PaymentMachine[];
  detailedSales: DetailedSale[];
  onSaveTransaction: (tx: Transaction) => void;
  onSaveCustomer: (customer: Customer) => void;
  onSaveDetailedSale: (sale: DetailedSale) => void;
}

export function CompleteSale({ 
  products, 
  customers, 
  machines, 
  detailedSales,
  onSaveTransaction, 
  onSaveCustomer,
  onSaveDetailedSale
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

        {/* Print rendering must be available globally or managed carefully */}
        {printMode && finalSale && (
          <div className="fixed inset-0 bg-white z-[100] p-12 text-black font-sans print-only overflow-visible">
            <header className="flex justify-between items-start border-b-4 border-black pb-8 mb-10">
              <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase">{COMPANY_INFO.name}</h1>
                <div className="text-sm font-bold text-slate-700 mt-2">
                  <p>CNPJ: {COMPANY_INFO.cnpj}</p>
                  <p>{COMPANY_INFO.address}</p>
                  <p>WhatsApp: {COMPANY_INFO.phone}</p>
                  <p>{COMPANY_INFO.email}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span className="bg-black text-white px-6 py-2 text-sm font-black uppercase tracking-widest">Contrato de Venda</span>
                <p className="text-sm font-black mt-2">Nº #{lastSaleId}</p>
                <p className="text-xs text-slate-500 font-bold uppercase">{formatDate(finalSale.createdAt)}</p>
              </div>
            </header>

            <section className="mb-10 grid grid-cols-2 gap-10">
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Dados do Cliente</h4>
                  <p className="text-2xl font-black">{finalSale.customerName}</p>
                  {customers.find(c => c.id === finalSale.customerId)?.cpf && <p className="text-sm font-bold mt-1">CPF: {customers.find(c => c.id === finalSale.customerId)?.cpf}</p>}
                  {customers.find(c => c.id === finalSale.customerId)?.phone && <p className="text-sm font-bold">Fone: {customers.find(c => c.id === finalSale.customerId)?.phone}</p>}
                  {customers.find(c => c.id === finalSale.customerId)?.address && <p className="text-xs mt-2 text-slate-600 italic leading-snug">{customers.find(c => c.id === finalSale.customerId)?.address}, {customers.find(c => c.id === finalSale.customerId)?.city}-{customers.find(c => c.id === finalSale.customerId)?.state}</p>}
               </div>
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Informações de Pagamento</h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase">Método:</span>
                      <span className="font-black">{finalSale.paymentMethod}</span>
                    </div>
                    {finalSale.paymentMethod === 'PIX' && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">Origem:</span>
                        <span className="font-black font-black uppercase text-[10px]">{finalSale.pixMethod || 'PIX GERAL'}</span>
                      </div>
                    )}
                    {finalSale.paymentMethod === 'Crédito' && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">Parcelas:</span>
                        <span className="font-black">{finalSale.installments || 1}x de {formatCurrency(finalSale.subtotal / (finalSale.installments || 1))}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                      <span className="text-sm font-black uppercase">Valor Total:</span>
                      <span className="text-xl font-black text-primary">{formatCurrency(finalSale.subtotal)}</span>
                    </div>
                  </div>
               </div>
            </section>

            <section className="mb-10 card rounded-[40px] border-2 border-black overflow-hidden shadow-none">
               <header className="bg-black text-white p-6 flex justify-between items-center">
                  <h4 className="text-sm font-black uppercase tracking-widest">Especificações do Aparelho</h4>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5"><ShieldCheck size={16} /> <span className="text-xs font-bold">Garantia Ativa</span></div>
                  </div>
               </header>
               <div className="p-8">
                 <div className="grid grid-cols-3 gap-y-10 gap-x-6">
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aparelho</p>
                     <p className="text-lg font-black">{finalSale.items[0]?.name}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Modelo</p>
                     <p className="text-lg font-bold">{finalSale.model || 'N/A'}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cor</p>
                     <p className="text-lg font-bold">{finalSale.color || 'N/A'}</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-900"><Database size={20} /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacidade</p>
                        <p className="font-black">{finalSale.storage || 'N/A'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-900"><Cpu size={20} /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RAM</p>
                        <p className="font-black">{finalSale.ram || 'N/A'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-900"><ShieldCheck size={20} /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Garantia</p>
                        <p className="font-black">{finalSale.warranty}</p>
                      </div>
                   </div>
                   <div className="col-span-2">
                     <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">IMEI do Equipamento</p>
                     <p className="text-xl font-mono font-black tracking-widest">
                       {finalSale.imei || 'SEM IMEI INFORMADO'}
                       {finalSale.imei2 ? ` / ${finalSale.imei2}` : ''}
                     </p>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Serial Number (S/N)</p>
                     <p className="text-xl font-mono font-bold">{finalSale.sn || 'N/A'}</p>
                   </div>
                 </div>
               </div>
            </section>

            {finalSale.observations && (
              <section className="mb-10 p-6 border-2 border-dotted border-slate-300 rounded-3xl">
                 <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Condições e Observações Extras</h4>
                 <p className="text-sm italic leading-relaxed text-slate-700">{finalSale.observations}</p>
              </section>
            )}

            <div className="mt-auto grid grid-cols-2 gap-12 pt-12">
              <div className="flex flex-col items-center">
                 <div className="w-full h-px bg-black mb-2"></div>
                 <p className="text-[10px] font-black uppercase tracking-widest">Assinatura do Cliente</p>
              </div>
              <div className="flex flex-col items-center">
                 <div className="w-full h-px bg-black mb-2"></div>
                 <p className="text-[10px] font-black uppercase tracking-widest">Assinatura {COMPANY_INFO.name}</p>
              </div>
            </div>

            <footer className="mt-12 pt-8 text-center text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] border-t border-slate-100">
               Contrato gerado eletronicamente • Sistema RTJK INFOCELL • {COMPANY_INFO.instagram}
            </footer>
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

      {/* RENDERIZAÇÃO PARA IMPRESSÃO A4 (FORMATO PADRÃO) */}
      {printMode && finalSale && (
        <div className="fixed inset-0 bg-white z-[100] p-12 text-black font-sans print-only overflow-visible">
          <header className="flex justify-between items-start border-b-4 border-black pb-8 mb-10">
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">{COMPANY_INFO.name}</h1>
              <div className="text-sm font-bold text-slate-700 mt-2">
                <p>CNPJ: {COMPANY_INFO.cnpj}</p>
                <p>{COMPANY_INFO.address}</p>
                <p>WhatsApp: {COMPANY_INFO.phone} / {COMPANY_INFO.phone2}</p>
                <p>{COMPANY_INFO.email}</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <span className="bg-black text-white px-6 py-2 text-sm font-black uppercase tracking-widest">Contrato de Venda</span>
              <p className="text-sm font-black mt-2">Nº #{lastSaleId}</p>
              <p className="text-xs text-slate-500 font-bold uppercase">{formatDate(new Date().toISOString())}</p>
            </div>
          </header>

          <section className="mb-10 grid grid-cols-2 gap-10">
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Dados do Cliente</h4>
                <p className="text-2xl font-black">{finalSale.customerName}</p>
                {customers.find(c => c.id === finalSale.customerId)?.cpf && <p className="text-sm font-bold mt-1">CPF: {customers.find(c => c.id === finalSale.customerId)?.cpf}</p>}
                {customers.find(c => c.id === finalSale.customerId)?.phone && <p className="text-sm font-bold">Fone: {customers.find(c => c.id === finalSale.customerId)?.phone}</p>}
                {customers.find(c => c.id === finalSale.customerId)?.address && <p className="text-xs mt-2 text-slate-600 italic leading-snug">{customers.find(c => c.id === finalSale.customerId)?.address}, {customers.find(c => c.id === finalSale.customerId)?.city}-{customers.find(c => c.id === finalSale.customerId)?.state}</p>}
             </div>
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Informações de Pagamento</h4>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Método:</span>
                    <span className="font-black">{finalSale.paymentMethod}</span>
                  </div>
                  {finalSale.paymentMethod === 'PIX' && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase">Origem:</span>
                      <span className="font-black">{finalSale.pixMethod || 'PIX GERAL'}</span>
                    </div>
                  )}
                  {(finalSale.paymentMethod === 'Crédito' || finalSale.paymentMethod === 'Débito') && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase">Parcelas:</span>
                      <span className="font-black">{finalSale.paymentMethod === 'Crédito' ? `${finalSale.installments}x de ${formatCurrency(finalSale.subtotal / (finalSale.installments || 1))}` : 'À Vista'}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                    <span className="text-sm font-black uppercase">Valor Total:</span>
                    <span className="text-xl font-black text-primary">{formatCurrency(finalSale.subtotal)}</span>
                  </div>
                </div>
             </div>
          </section>

          <section className="mb-10 card rounded-[40px] border-2 border-black overflow-hidden shadow-none">
             <header className="bg-black text-white p-6 flex justify-between items-center">
                <h4 className="text-sm font-black uppercase tracking-widest">Especificações do Aparelho</h4>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5"><ShieldCheck size={16} /> <span className="text-xs font-bold">Garantia Ativa</span></div>
                </div>
             </header>
             <div className="p-8">
               <div className="grid grid-cols-3 gap-y-10 gap-x-6">
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aparelho</p>
                   <p className="text-lg font-black">{finalSale.items[0]?.name}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Modelo</p>
                   <p className="text-lg font-bold">{finalSale.model || 'N/A'}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cor</p>
                   <p className="text-lg font-bold">{finalSale.color || 'N/A'}</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-900"><Database size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacidade</p>
                      <p className="font-black">{finalSale.storage || 'N/A'}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-900"><Cpu size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RAM</p>
                      <p className="font-black">{finalSale.ram || 'N/A'}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-900"><ShieldCheck size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Garantia</p>
                      <p className="font-black">{finalSale.warranty}</p>
                    </div>
                 </div>
                 <div className="col-span-2">
                   <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">IMEI do Equipamento</p>
                   <p className="text-xl font-mono font-black tracking-widest">
                     {finalSale.imei || 'SEM IMEI INFORMADO'}
                     {finalSale.imei2 ? ` / ${finalSale.imei2}` : ''}
                   </p>
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Serial Number (S/N)</p>
                   <p className="text-xl font-mono font-bold">{finalSale.sn || 'N/A'}</p>
                 </div>
               </div>
             </div>
          </section>

          {finalSale.observations && (
            <section className="mb-10 p-6 border-2 border-dotted border-slate-300 rounded-3xl">
               <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Condições e Observações Extras</h4>
               <p className="text-sm italic leading-relaxed text-slate-700">{finalSale.observations}</p>
            </section>
          )}

          <div className="mt-auto grid grid-cols-2 gap-12 pt-12">
            <div className="flex flex-col items-center">
               <div className="w-full h-px bg-black mb-2"></div>
               <p className="text-[10px] font-black uppercase tracking-widest">Assinatura do Cliente</p>
            </div>
            <div className="flex flex-col items-center">
               <div className="w-full h-px bg-black mb-2"></div>
               <p className="text-[10px] font-black uppercase tracking-widest">Assinatura {COMPANY_INFO.name}</p>
            </div>
          </div>

          <footer className="mt-12 pt-8 text-center text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] border-t border-slate-100">
             Contrato gerado eletronicamente • Sistema RTJK INFOCELL • {COMPANY_INFO.instagram}
          </footer>
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
