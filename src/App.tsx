import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { MobileFullMenu } from './components/MobileFullMenu';
import { Dashboard } from './components/Dashboard';
import { ServiceOrders } from './components/ServiceOrders';
import { QuickSale } from './components/Sales';
import { CompleteSale } from './components/CompleteSale';
import { Inventory } from './components/Inventory';
import { Customers } from './components/Customers';
import { Financial } from './components/Financial';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { OSCustomerConsultation } from './components/OSCustomerConsultation';
import { cn } from './lib/utils';
import { COMPANY_INFO } from './constants';
import { ServiceOrder, Product, Customer, Transaction, PaymentMachine, DetailedSale, StoreSettings } from './types';

const initialStoreSettings: StoreSettings = {
  name: COMPANY_INFO.name,
  corporateName: 'RTJK INFOCELL LTDA',
  cnpj: COMPANY_INFO.cnpj,
  phone1: COMPANY_INFO.phone,
  phone2: COMPANY_INFO.phone2,
  email: COMPANY_INFO.email,
  instagram: COMPANY_INFO.instagram,
  address: COMPANY_INFO.address,
};

const initialOS: ServiceOrder[] = [
  { id: '8922', customerId: '1', customerName: 'Ricardo Mendes', device: 'iPhone 13 Pro', problem: 'Troca de Tela', status: 'Aguardando Peça', priority: 'Normal', type: 'Nova', totalValue: 1200, entryDate: '2024-04-10', createdAt: '2024-04-10T10:00:00Z', updatedAt: '2024-04-12T14:30:00Z' },
  { id: '8921', customerId: '2', customerName: 'Ana Clara Silva', device: 'Samsung S22', problem: 'Troca de Bateria', status: 'Pronto', priority: 'Normal', type: 'Nova', totalValue: 450, entryDate: '2024-04-11', createdAt: '2024-04-11T09:15:00Z', updatedAt: '2024-04-13T11:00:00Z' },
  { id: '8920', customerId: '3', customerName: 'Julio Cesar', device: 'Macbook Air M1', problem: 'Limpeza Preventiva', status: 'Em Manutenção', priority: 'Normal', type: 'Nova', totalValue: 350, entryDate: '2024-04-12', createdAt: '2024-04-12T15:45:00Z', updatedAt: '2024-04-12T15:45:00Z' },
  { id: '8919', customerId: '4', customerName: 'Beatriz Souza', device: 'Motorola G60', problem: 'Conector de Carga', status: 'Orçamento', priority: 'Urgente', type: 'Nova', totalValue: 180, entryDate: '2024-04-13', createdAt: '2024-04-13T08:30:00Z', updatedAt: '2024-04-13T08:30:00Z' },
  { id: '8918', customerId: '5', customerName: 'Marcos Paulo', device: 'Xiaomi Redmi Note 11', problem: 'Troca de Vidro Traseiro', status: 'Pronto', priority: 'Normal', type: 'Nova', totalValue: 520, entryDate: '2024-04-13', createdAt: '2024-04-13T14:20:00Z', updatedAt: '2024-04-14T10:00:00Z' },
];

const initialProducts: Product[] = [
  { id: '1', name: 'Película de Vidro 3D', category: 'Acessórios', price: 45, cost: 5, stock: 50, minStock: 10 },
  { id: '2', name: 'Cabo Lightning Original', category: 'Acessórios', price: 120, cost: 40, stock: 15, minStock: 5 },
  { id: '3', name: 'Fone Bluetooth Pro', category: 'Acessórios', price: 250, cost: 100, stock: 2, minStock: 3 },
  { id: '4', name: 'Carregador Turbo 20W', category: 'Acessórios', price: 150, cost: 60, stock: 20, minStock: 5 },
  { id: '5', name: 'Tela iPhone 13 Pro', category: 'Peças', price: 850, cost: 450, stock: 3, minStock: 2 },
  { id: '6', name: 'Bateria Samsung S22', category: 'Peças', price: 180, cost: 60, stock: 1, minStock: 2 },
];

const initialCustomers: Customer[] = [
  { id: '1', name: 'Ricardo Mendes', phone: '(11) 98888-7777', email: 'ricardo@email.com', cpf: '123.456.789-00' },
  { id: '2', name: 'Ana Clara Silva', phone: '(11) 97777-6666', email: 'ana@email.com', cpf: '234.567.890-11' },
  { id: '3', name: 'Julio Cesar', phone: '(11) 96666-5555', email: 'julio@email.com', cpf: '345.678.901-22' },
  { id: '4', name: 'Beatriz Souza', phone: '(11) 95555-4444', cpf: '456.789.012-33' },
  { id: '5', name: 'Marcos Paulo', phone: '(11) 94444-3333', email: 'marcos@email.com', cpf: '567.890.123-44' },
];

const initialTransactions: Transaction[] = [
  { id: '1', type: 'Entrada', category: 'Venda', description: 'Venda de Película e Cabo', value: 165.00, date: '2024-04-14T10:00:00Z' },
  { id: '2', type: 'Saída', category: 'Fornecedor', description: 'Compra de Telas iPhone', value: 1200.00, date: '2024-04-14T11:30:00Z' },
  { id: '3', type: 'Entrada', category: 'Serviço', description: 'OS #8921 - Troca de Bateria', value: 450.00, date: '2024-04-14T14:00:00Z' },
  { id: '4', type: 'Saída', category: 'Aluguel', description: 'Aluguel da Loja - Abril', value: 2500.00, date: '2024-04-10T09:00:00Z' },
  { id: '5', type: 'Entrada', category: 'Venda', description: 'Venda de Fone Bluetooth', value: 250.00, date: '2024-04-13T16:45:00Z' },
];

const initialMachines: PaymentMachine[] = [
  {
    id: '1',
    name: 'SumUp',
    pixFee: 0,
    debitFee: 1.9,
    creditFees: {
      1: 4.6, 2: 5.9, 3: 7.2, 4: 8.5, 5: 9.8, 6: 11.1,
      7: 12.4, 8: 13.7, 9: 15.0, 10: 16.3, 11: 17.6, 12: 18.9
    }
  },
  {
    id: '2',
    name: 'Mercado Pago',
    pixFee: 0,
    debitFee: 1.99,
    creditFees: {
      1: 4.74, 2: 5.41, 3: 6.08, 4: 6.75, 5: 7.42, 6: 8.09,
      7: 8.76, 8: 9.43, 9: 10.10, 10: 10.77, 11: 11.44, 12: 12.11
    }
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isExternalAccess, setIsExternalAccess] = useState(false);
  const [initialSearch, setInitialSearch] = useState('');
  
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(initialOS);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [detailedSales, setDetailedSales] = useState<DetailedSale[]>([]);
  const [machines, setMachines] = useState<PaymentMachine[]>(initialMachines);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(initialStoreSettings);

  const isPublicView = isExternalAccess && activeTab === 'consulta';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const osId = params.get('os');
    const view = params.get('view');
    
    if (osId || view === 'consulta') {
      setIsExternalAccess(true);
      setActiveTab('consulta');
      if (osId) setInitialSearch(osId);
    }
  }, []);

  const handleSaveOS = (os: ServiceOrder) => {
    setServiceOrders(prev => {
      const exists = prev.find(item => item.id === os.id);
      if (exists) {
        return prev.map(item => item.id === os.id ? os : item);
      }
      return [os, ...prev];
    });
  };

  const handleSaveProduct = (product: Product) => {
    setProducts(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? product : item);
      }
      return [product, ...prev];
    });
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveCustomer = (customer: Customer) => {
    setCustomers(prev => {
      const exists = prev.find(item => item.id === customer.id);
      if (exists) {
        return prev.map(item => item.id === customer.id ? customer : item);
      }
      return [customer, ...prev];
    });
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveTransaction = (tx: Transaction) => {
    setTransactions(prev => {
      const exists = prev.find(item => item.id === tx.id);
      if (exists) {
        return prev.map(item => item.id === tx.id ? tx : item);
      }
      return [tx, ...prev];
    });
  };

  const handleSaveDetailedSale = (sale: DetailedSale) => {
    setDetailedSales(prev => {
      const exists = prev.find(s => s.id === sale.id);
      if (exists) {
        return prev.map(s => s.id === sale.id ? sale : s);
      }
      return [sale, ...prev];
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard serviceOrders={serviceOrders} transactions={transactions} setActiveTab={setActiveTab} />;
      case 'os':
        return <ServiceOrders serviceOrders={serviceOrders} onSaveOS={handleSaveOS} customers={customers} machines={machines} onSaveTransaction={handleSaveTransaction} />;
      case 'venda-rapida':
        return <QuickSale 
          products={products} 
          customers={customers} 
          machines={machines} 
          onSaveTransaction={handleSaveTransaction} 
          onSaveCustomer={handleSaveCustomer} 
          storeSettings={storeSettings}
        />;
      case 'venda-completa':
        return <CompleteSale 
          products={products} 
          customers={customers} 
          machines={machines} 
          detailedSales={detailedSales}
          onSaveTransaction={handleSaveTransaction} 
          onSaveCustomer={handleSaveCustomer}
          onSaveDetailedSale={handleSaveDetailedSale}
          storeSettings={storeSettings}
        />;
      case 'estoque':
        return <Inventory 
          products={products} 
          onSaveProduct={handleSaveProduct} 
          onDeleteProduct={handleDeleteProduct} 
          storeSettings={storeSettings}
        />;
      case 'clientes':
        return <Customers customers={customers} serviceOrders={serviceOrders} transactions={transactions} onSaveCustomer={handleSaveCustomer} onDeleteCustomer={handleDeleteCustomer} />;
      case 'financeiro':
        return <Financial transactions={transactions} onSaveTransaction={handleSaveTransaction} />;
      case 'relatorios':
        return <Reports serviceOrders={serviceOrders} transactions={transactions} products={products} />;
      case 'configuracoes':
        return <Settings 
          machines={machines} 
          onSaveMachines={setMachines} 
          storeSettings={storeSettings}
          onSaveStoreSettings={setStoreSettings}
        />;
      case 'consulta':
        return (
          <OSCustomerConsultation 
            serviceOrders={serviceOrders} 
            customers={customers}
            initialSearch={initialSearch} 
          />
        );
      case 'menu':
        return <MobileFullMenu onSelect={setActiveTab} onClose={() => setActiveTab('dashboard')} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-text-muted">
            <h2 className="text-xl font-bold mb-2">Módulo em Desenvolvimento</h2>
            <p>O módulo "{activeTab}" estará disponível em breve.</p>
          </div>
        );
    }
  };

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Geral';
      case 'os': return 'Ordens de Serviço';
      case 'venda-rapida': return 'Venda Rápida';
      case 'venda-completa': return 'Venda Completa (Aparelhos)';
      case 'estoque': return 'Estoque / Produtos';
      case 'clientes': return 'Clientes';
      case 'financeiro': return 'Financeiro';
      case 'relatorios': return 'Relatórios';
      case 'menu': return 'Menu Principal';
      case 'taxas': return 'Taxas de Máquina';
      case 'configuracoes': return 'Configurações';
      default: return activeTab;
    }
  };

  return (
    <div className="flex min-h-screen bg-bg">
      {!isPublicView && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} storeSettings={storeSettings} />}
      
      <main className={cn("flex-1 overflow-y-auto pb-24 lg:pb-8", !isPublicView && "p-4 md:p-8")}>
        <div className={cn("mx-auto flex flex-col gap-6", !isPublicView && "max-w-7xl")}>
          {!isPublicView && (
            <div className="flex items-center gap-2 text-sm no-print">
              <span className="text-text-muted">Início</span>
              <span className="text-text-muted">/</span>
              <span className="font-semibold">{getBreadcrumb()}</span>
            </div>
          )}
          
          {renderContent()}
        </div>
      </main>

      {!isPublicView && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
}
