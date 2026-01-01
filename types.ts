import React from 'react';

export interface Transaction {
  id: string;
  date: string; // Unified date field
  earningMonth?: string; // ISO Date string (YYYY-MM-01) representing the earning month
  releaseDate?: string;
  receivedDate?: string | null;
  durationDays?: number | null;
  platform?: 'Youtube' | 'Tiktok';
  method?: string;
  rate?: number;
  expectedUsd?: number;
  expectedPkr?: number;
  receivedPkr: number;
  taxUsd: number;
  taxPkr?: number;
  taxPercent?: number;
  netUsd: number;
  netPkr?: number;
  status: string; // Changed to string to support generic status from Excel
}

export interface Report {
  id: string;
  companyName: string;
  generatedAt: string | number; // Timestamp or ISO string
  transactions: Transaction[];
  status?: 'Draft' | 'Finalized';
}

export interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ReactNode;
  colorClass: string;
}