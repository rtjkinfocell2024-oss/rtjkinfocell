import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ServiceOrders } from './components/ServiceOrders';
import { QuickSale } from './components/Sales';
import { Inventory } from './components/Inventory';
import { Customers } from './components/Customers';
import { Financial } from './components/Financial';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { cn } from './lib/utils';
import { ServiceOrder } from './types';

const initialOS: ServiceOrder[] = [
  { id: '8922', customerId: '1', customerName: 'Ricardo Mendes', device: 'iPhone 13 Pro', problem: 'Troca de Tela', status: 'Aguardando Peça', totalValue: 1200, createdAt: '2024-04-10T10:00:00Z', updatedAt: '2024-04-12T14:30:00Z' },
  { id: '8921', customerId: '2', customerName: 'Ana Clara Silva', device: 'Samsung S22', problem: 'Troca de Bateria', status: 'Pronto', totalValue: 450, createdAt: '2024-04-11T09:15:00Z', updatedAt: '2024-04-13T11:00:00Z' },
  { id: '8920', customerId: '3', customerName: 'Julio Cesar', device: 'Macbook Air M1', problem: 'Limpeza Preventiva', status: 'Em Manutenção', totalValue: 350, createdAt: '2024-04-12T15:45:00Z', updatedAt: '2024-04-12T15:45:00Z' },
  { id: '8919', customerId: '4', customerName: 'Beatriz Souza', device: 'Motorola G60', problem: 'Conector de Carga', status: 'Orçamento', totalValue: 180, createdAt: '2024-04-13T08:30:00Z', updatedAt: '2024-04-13T08:30:00Z' },
  { id: '8918', customerId: '5', customerName: 'Marcos Paulo', device: 'Xiaomi Redmi Note 11', problem: 'Troca de Vidro Traseiro', status: 'Pronto', totalValue: 520, createdAt: '2024-04-13T14:20:00Z', updatedAt: '2024-04-14T10:00:00Z' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(initialOS);

  const handleSaveOS = (os: ServiceOrder) => {
    setServiceOrders(prev => {
      const exists = prev.find(item => item.id === os.id);
      if (exists) {
        return prev.map(item => item.id === os.id ? os : item);
      }
      return [os, ...prev];
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard serviceOrders={serviceOrders} />;
      case 'os':
        return <ServiceOrders serviceOrders={serviceOrders} onSaveOS={handleSaveOS} />;
      case 'venda-rapida':
        return <QuickSale />;
      case 'estoque':
        return <Inventory />;
      case 'clientes':
        return <Customers />;
      case 'financeiro':
        return <Financial />;
      case 'relatorios':
        return <Reports />;
      case 'configuracoes':
        return <Settings />;
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
      case 'estoque': return 'Estoque / Produtos';
      case 'clientes': return 'Clientes';
      case 'financeiro': return 'Financeiro';
      case 'relatorios': return 'Relatórios';
      case 'taxas': return 'Taxas de Máquina';
      case 'configuracoes': return 'Configurações';
      default: return activeTab;
    }
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-muted">Início</span>
            <span className="text-text-muted">/</span>
            <span className="font-semibold">{getBreadcrumb()}</span>
          </div>
          
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
