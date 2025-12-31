
export type Lang = "ar" | "en";
export type Role = "admin" | "staff" | "mentor";
export type SubscriptionPlan = "daily" | "weekly" | "monthly";
export type PaymentMethod = "cash" | "bank";
export type ExpenseCategory = "rent" | "salary" | "utilities" | "marketing" | "supplies" | "other";
export type EnrollmentStatus = "active" | "completed" | "dropped";

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  name: string;
}

export interface Mentor {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface Student {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface Course {
  id: string;
  title: string;
  mentorId?: string;
  priceTotal: number;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  paidAmount: number;
  attendance: Record<string, boolean>; // Key is date string YYYY-MM-DD
  grade?: number; // 0-100
  status: EnrollmentStatus;
  createdAt: string;
}

export interface WorkspaceSession {
  id: string;
  date: string; // YYYY-MM-DD
  personName: string;
  checkInAt: string; // ISO
  checkOutAt?: string; // ISO
}

export interface Subscription {
  id: string;
  studentId?: string;
  personName: string;
  plan: SubscriptionPlan;
  totalPrice: number;
  paidAmount: number;
  method: PaymentMethod;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  createdAt: string;
}

export interface Settings {
  lang: Lang;
  hourlyRate: number;
  theme: 'light' | 'dark';
  currency: string;
  subPrices: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}
