import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatBRLInput(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '0,00';
  
  // If it's already a number, convert to a cents string representation
  let cleanValue = '';
  if (typeof value === 'number') {
    // Avoid floating point precision issues by rounding to 2 decimals first
    cleanValue = Math.round(value * 100).toString();
  } else {
    cleanValue = String(value).replace(/\D/g, '');
  }
  
  if (!cleanValue || cleanValue === '0') return '0,00';
  
  const numberValue = parseFloat(cleanValue) / 100;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numberValue);
}

export function parseBRLInput(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  
  // If it comes with periods and commas (Brazilian format), e.g. 2.592,10
  // Remove thousand dots, and change decimal comma to a dot.
  // This satisfies the cleaning requirement:
  // (valorString.replace(/\./g, '').replace(',', '.'))
  const cleanStr = value.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : parsed;
}

export function parseCentsBRLInput(value: string): number {
  const cleanValue = value.replace(/\D/g, '');
  if (!cleanValue) return 0;
  return parseFloat(cleanValue) / 100;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}
