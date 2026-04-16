/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: 'Acessórios' | 'Peças' | 'Celular' | 'Outros';
  brand?: string;
  model?: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  supplier?: string;
  barcode?: string;
  imei1?: string;
  imei2?: string;
  sn?: string;
  color?: string;
  condition?: 'Novo' | 'Semi-Novo';
}

export interface Service {
  id: string;
  name: string;
  price: number;
  category: 'Reparo' | 'Manutenção' | 'Software' | 'Outros';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  cpf: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
}

export type OSStatus = 'Pendente' | 'Orçamento' | 'Aguardando Peça' | 'Em Manutenção' | 'Pronto' | 'Entregue' | 'Cancelado';
export type OSPriority = 'Baixa' | 'Normal' | 'Alta' | 'Urgente';

export interface ServiceOrder {
  id: string;
  customerId: string;
  customerName: string;
  device: string;
  serialNumber?: string;
  problem: string;
  solution?: string;
  status: OSStatus;
  priority: OSPriority;
  totalValue: number;
  entryDate: string;
  deliveryForecast?: string;
  technicalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  type: 'product' | 'service';
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'Dinheiro' | 'PIX' | 'Débito' | 'Crédito';
  machineFee: number;
  netValue: number;
  createdAt: string;
}

export interface PaymentMachine {
  id: string;
  name: string;
  pixFee: number;
  debitFee: number;
  creditFees: {
    [key: number]: number; // 1 to 12
  };
}

export interface Transaction {
  id: string;
  type: 'Entrada' | 'Saída';
  category: string;
  description: string;
  value: number;
  date: string;
  machineId?: string;
  installments?: number;
  customerId?: string;
}
