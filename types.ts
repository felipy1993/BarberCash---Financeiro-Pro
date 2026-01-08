
export type TransactionType = 'INCOME' | 'EXPENSE';
export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'DÉBITO' | 'CRÉDITO' | 'OUTRO';
export type UserRole = 'ADMIN' | 'USER';
export type AppointmentStatus = 'AGENDADO' | 'CONCLUÍDO' | 'CANCELADO';

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
}

export interface Product {
  id: string;
  name: string;
  purchasePrice: number;
  profitMargin: number;
  price: number;
  stock: number;
  category: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  service: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: AppointmentStatus;
  price: number;
  notes?: string;
  phone?: string;
}

export interface CategoryState {
  INCOME: string[];
  EXPENSE: string[];
}

export const INITIAL_CATEGORIES: CategoryState = {
  INCOME: ['CORTE DE CABELO', 'BARBA', 'COMBO', 'PRODUTOS', 'OUTROS'],
  EXPENSE: ['ALUGUEL', 'ENERGIA/ÁGUA', 'MATERIAIS', 'MARKETING', 'LIMPEZA', 'OUTROS']
};
