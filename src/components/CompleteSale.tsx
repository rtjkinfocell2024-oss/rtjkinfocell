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
  Database,
  Smartphone,
  DollarSign,
  Shield,
  Calendar,
  CreditCard,
  Tag
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
  onSaveProduct: (product: Product) => void;
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
  onSaveProduct,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<string>('Garantia de 90 dias');

  const filteredSales = useMemo(() => {
    if (!searchQuery) return detailedSales;
    const query = searchQuery.toLowerCase();
    return detailedSales.filter(sale => 
      sale.id.toLowerCase().includes(query) ||
      sale.customerName.toLowerCase().includes(query) ||
      sale.model?.toLowerCase().includes(query) ||
      sale.imei?.includes(query) ||
      sale.imei2?.includes(query) ||
      sale.paymentMethod?.toLowerCase().includes(query) ||
      sale.items.some(item => item.name.toLowerCase().includes(query))
    );
  }, [detailedSales, searchQuery]);

  const stats = useMemo(() => {
    const totalRevenue = detailedSales.reduce((acc, s) => acc + s.total, 0);
    const totalSalesCount = detailedSales.length;
    const warrantyCount = detailedSales.filter(s => s.status === 'Finalizada').length;
    return { totalRevenue, totalSalesCount, warrantyCount };
  }, [detailedSales]);

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

  const handleSaveProductInternally = (product: Product) => {
    onSaveProduct(product);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleView = (sale: DetailedSale) => {
    setFinalSale(sale);
    setLastSaleId(sale.id);
    setSelectedWarranty(sale.warranty || 'Garantia de 90 dias');
    setIsPreviewModalOpen(true);
  };

  const handleSuccessPrint = () => {
    if (finalSale) {
      setSelectedWarranty(finalSale.warranty || 'Garantia de 90 dias');
    }
    setIsSuccess(false);
    setIsPreviewModalOpen(true);
  };

  const resetForm = () => {
    setIsSuccess(false);
    setEditingSale(null);
    setIsSaleModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-24 lg:pb-10">
      {/* Header com breadcrumb ou título */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-text-main">Vendas de Aparelhos</h2>
          <p className="text-sm text-text-muted font-medium">Histórico e gestão de vendas completas realizadas</p>
        </div>
        <button 
          onClick={() => {
            setEditingSale(null);
            setIsSaleModalOpen(true);
          }}
          className="btn-primary flex items-center justify-center gap-2 h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 transition-transform active:scale-95"
        >
          <Plus size={20} />
          Nova Venda de Aparelho
        </button>
      </div>

      {/* Cards de Métricas Rápidas (Para revolucionar o espaço, deixar profissional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 bg-white border border-border rounded-2xl flex flex-row items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Aparelhos Vendidos</span>
            <span className="text-3xl font-black text-text-main tracking-tight">{stats.totalSalesCount}</span>
            <span className="text-[10px] text-emerald-500 font-bold">Unidades registradas</span>
          </div>
          <div className="p-3.5 bg-primary/10 text-primary rounded-2xl">
            <Smartphone size={24} />
          </div>
        </div>

        <div className="card p-5 bg-white border border-border rounded-2xl flex flex-row items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Faturamento de Vendas</span>
            <span className="text-3xl font-black text-text-main tracking-tight">{formatCurrency(stats.totalRevenue)}</span>
            <span className="text-[10px] text-emerald-500 font-bold">Faturamento total líquido</span>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="card p-5 bg-white border border-border rounded-2xl flex flex-row items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Dispositivos em Garantia</span>
            <span className="text-3xl font-black text-text-main tracking-tight">{stats.warrantyCount}</span>
            <span className="text-[10px] text-primary font-bold">Cobertura ativa na loja</span>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* Card da Tabela Principal */}
      <div className="card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col bg-white">
        <div className="p-6 border-b border-border bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h3 className="text-base font-black text-text-main">Vendas Recentes</h3>
            <p className="text-xs text-text-muted">Lista de dispositivos comercializados e termos emitidos</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por cliente, aparelho, IMEI ou pagamento..." 
              className="input pl-10 text-xs h-10 w-full rounded-xl bg-white border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-x-auto">
          {filteredSales.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center text-center p-10">
              <FileText size={48} className="mb-3 text-text-muted/40 animate-pulse" />
              <p className="text-base font-bold text-text-main">Nenhuma venda encontrada</p>
              <p className="text-xs text-text-muted max-w-xs mt-1">Nenhum registro corresponde aos filtros ou não há vendas registradas no sistema.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">ID / Aparelho</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">IMEI & Detalhes</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Pagamento</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Garantia</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Data</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Total</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* ID / Aparelho */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-primary uppercase tracking-wider font-sans">#{sale.id}</span>
                        <span className="font-bold text-sm text-text-main leading-tight mt-0.5">
                          {sale.items[0]?.name}
                        </span>
                        {sale.model && (
                          <span className="text-xs text-text-muted font-medium mt-0.5">{sale.model}</span>
                        )}
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-text-main leading-tight">{sale.customerName}</span>
                        <span className="text-xs text-text-muted font-medium mt-0.5">
                          {customers.find(c => c.id === sale.customerId)?.phone || 'Sem Telefone'}
                        </span>
                      </div>
                    </td>

                    {/* IMEI & Detalhes */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-main font-sans">
                          IMEI: {sale.imei || 'N/A'}
                        </span>
                        {sale.imei2 && (
                          <span className="text-[10px] text-text-muted font-medium mt-0.5 font-sans">IMEI 2: {sale.imei2}</span>
                        )}
                        {(sale.color || sale.storage) && (
                          <span className="text-[10px] text-text-muted font-medium mt-0.5">
                            {sale.color || '--'} • {sale.storage || '--'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Pagamento */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-text-main">
                          <CreditCard size={12} className="text-text-muted" />
                          {sale.paymentMethod}
                        </span>
                        {sale.installments && sale.installments > 1 ? (
                          <span className="text-[10px] text-primary font-bold mt-0.5 font-sans">
                            Parcelado {sale.installments}x
                          </span>
                        ) : (
                          <span className="text-[10px] text-text-muted font-medium mt-0.5 font-sans">À Vista</span>
                        )}
                      </div>
                    </td>

                    {/* Garantia */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                        <Shield size={12} />
                        {sale.warranty || 'Sem garantia'}
                      </span>
                    </td>

                    {/* Data */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-text-muted font-sans">{formatDate(sale.createdAt)}</span>
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4">
                      <span className="font-black text-sm text-text-main font-sans">{formatCurrency(sale.total)}</span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-250">
                        <ShieldCheck size={12} className="text-emerald-500" />
                        {sale.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleView(sale)}
                          className="p-2 bg-slate-50 hover:bg-primary/10 text-text-muted hover:text-primary rounded-xl transition-all shadow-sm border border-border flex items-center justify-center"
                          title="Imprimir Comprovante / Recibo"
                        >
                          <Printer size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(sale)}
                          className="p-2 bg-slate-50 hover:bg-primary/10 text-text-muted hover:text-primary rounded-xl transition-all shadow-sm border border-border flex items-center justify-center"
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

        {/* MODAL DE PRÉ-VISUALIZAÇÃO DE RECIBO DE VENDA */}
        {isPreviewModalOpen && finalSale && (
          <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/85 backdrop-blur-md overflow-y-auto p-4 lg:p-10 print:hidden animate-in fade-in duration-300">
             {/* Barra de Controle superior */}
             <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-slate-900 text-white p-5 rounded-2xl shadow-2xl border border-slate-800">
                <div className="flex items-center gap-3.5">
                   <div className="p-3 bg-primary/20 text-primary rounded-xl">
                      <FileText size={22} className="animate-pulse" />
                   </div>
                   <div>
                      <h3 className="font-black text-sm uppercase tracking-wider text-white">Visualização do Recibo de Venda</h3>
                      <p className="text-xs text-slate-400 font-medium">Selecione o período de garantia contratual diretamente no documento antes de imprimir.</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                   <button 
                     onClick={() => setIsPreviewModalOpen(false)}
                     className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-black uppercase tracking-wider transition-all"
                   >
                      Fechar
                   </button>
                   <button 
                     onClick={handlePrint}
                     className="flex-1 sm:flex-none btn-primary flex items-center justify-center gap-2 h-10 px-6 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                   >
                      <Printer size={16} />
                      Confirmar e Imprimir
                   </button>
                </div>
             </div>

             {/* Folha A4 interativa renderizada na tela */}
             <div className="w-full max-w-4xl mx-auto bg-white text-black p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-200 flex flex-col min-h-[297mm]">
                <div className="print-area a4-container flex flex-col flex-1 bg-white text-black font-sans">
                   <div className="a4-content flex flex-col flex-1">
                      {/* Cabeçalho */}
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
                                     <span className="italic font-black text-slate-900">{selectedWarranty}</span>
                                  </div>
                               </div>
                            </div>
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
                                      <td className="px-3 py-3 text-right text-slate-600">{(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                      <td className="px-3 py-3 text-right text-slate-900">{(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>

                         {/* 4. BLOCO FINANCEIRO E TERMOS EM DUAS COLUNAS LADO A LADO */}
                         <div className="grid grid-cols-5 gap-4">
                            {/* Coluna da Esquerda (Termos, Garantia, Observações) - col-span-3 */}
                            <div className="col-span-3 space-y-3">
                               {/* Termos de Venda */}
                               <div className="border border-slate-200 p-3 rounded-lg">
                                  <h4 className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-widest">Termo de garantia</h4>
                                  <div className="text-[9px] font-bold text-slate-600 leading-tight space-y-1">
                                     <p>• O cliente declara ter testado e aprovado o aparelho no ato da compra.</p>
                                     <div className="flex items-center gap-1.5 flex-wrap print:hidden">
                                        <span className="text-slate-800">Selecione a Garantia:</span>
                                        <select 
                                          value={selectedWarranty} 
                                          onChange={(e) => setSelectedWarranty(e.target.value)}
                                          className="border border-slate-300 rounded px-1.5 py-0.5 text-[9px] font-black text-slate-900 bg-white cursor-pointer hover:border-slate-400"
                                        >
                                          <option value="Garantia de 30 dias">Garantia de 30 dias</option>
                                          <option value="Garantia de 90 dias">Garantia de 90 dias</option>
                                          <option value="Garantia de 180 dias">Garantia de 180 dias</option>
                                          <option value="Garantia de 1 ano">Garantia de 1 ano</option>
                                          <option value="Sem garantia">Sem garantia</option>
                                        </select>
                                     </div>
                                     <p>• A garantia de <span className="font-black text-slate-950 underline">{selectedWarranty}</span> é restrita a hardware interno.</p>
                                     <p>• Quebras de tela, carcaça ou danos por líquido invalidam o termo.</p>
                                     {selectedWarranty === 'Garantia de 180 dias' && (
                                        <p className="mt-2 text-[8px] leading-snug font-black text-slate-800 border-t border-slate-200 pt-1.5 uppercase">
                                           A garantia nao cobre: Defeitos ou danos causados pelo uso inadequado do produto pelo cliente, como pecas arranhadas, trincadas, quebradas externamente ou internamente derramamento de liquidos de qualquer natureza, danos causados por agentes naturais (chuva, maresia, descarga eletrica e outros), Obs: Remoção da película perca de garantia no ato, exposicao excessiva ao calor.
                                        </p>
                                     )}
                                  </div>
                               </div>

                               {/* Observações */}
                               <div className="border border-slate-200 p-3 rounded-lg">
                                  <h4 className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-widest">Observações Gerais</h4>
                                  <p className="text-[9px] font-bold text-slate-600 leading-tight italic line-clamp-3">
                                     {finalSale.observations || "Nenhuma observação adicional registrada para esta venda."}
                                  </p>
                               </div>
                            </div>

                            {/* Coluna da Direita (Bloco Financeiro Modelado em Card Profissional) - col-span-2 */}
                            <div className="col-span-2 flex flex-col justify-start">
                               <div className="border-2 border-slate-900 bg-slate-50 rounded-xl p-4 flex flex-col shadow-sm">
                                  <h4 className="text-[8px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 mb-2">Resumo Financeiro</h4>
                                  <div className="space-y-1.5">
                                     <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                                        <span>Subtotal:</span>
                                        <span className="text-slate-950 font-black">{(finalSale.subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                     </div>
                                     <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                                        <span>Desconto:</span>
                                        <span className="text-red-750 font-black">-{(finalSale.discount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                     </div>
                                     <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                                        <span>Pagamento:</span>
                                        <span className="text-slate-950 font-black uppercase text-right leading-tight">{finalSale.paymentMethod} {finalSale.paymentMethod === 'Crédito' ? `(${finalSale.installments}x)` : ''}</span>
                                     </div>
                                     <div className="h-px bg-slate-200 my-1.5"></div>
                                     <div className="flex justify-between items-baseline pt-0.5">
                                        <span className="text-[9px] uppercase font-black text-slate-950 tracking-wider">Total Geral:</span>
                                        <span className="text-lg font-black text-slate-900 font-sans">{(finalSale.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </div>

                         {/* 5. ASSINATURAS E RODAPÉ */}
                         <div className="mt-6 pt-4 border-t border-dashed border-slate-300">
                            <div className="grid grid-cols-2 gap-10">
                               <div className="flex flex-col items-center">
                                  <div className="w-full h-px bg-slate-400"></div>
                                  <p className="text-[8px] font-black uppercase text-slate-600 mt-1">Assinatura do Comprador</p>
                                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{finalSale.customerName}</p>
                               </div>
                               <div className="flex flex-col items-center">
                                  <div className="w-full h-px bg-slate-400"></div>
                                  <p className="text-[8px] font-black uppercase text-slate-600 mt-1">Representante / {storeSettings.name}</p>
                                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{storeSettings.corporateName || storeSettings.name}</p>
                               </div>
                            </div>
                            <footer className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-6 text-center">
                               RECIBO EMITIDO EM {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                            </footer>
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
        onSaveProduct={handleSaveProductInternally}
        sale={editingSale}
        mode={editingSale ? 'edit' : 'create'}
        products={products}
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
               <button onClick={handleSuccessPrint} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 animate-pulse">
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
