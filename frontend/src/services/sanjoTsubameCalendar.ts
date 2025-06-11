import { apiClient } from './api';

export interface SanjoTsubameStatusResponse {
  year: number;
  month: number;
  date: number;
  status: 'on' | 'off' | 'undefined';
}

export interface SanjoTsubameMonthResponse {
  year: number;
  month: number;
  data: Record<string, 'on' | 'off' | 'undefined'>;
}

export interface SanjoTsubameCalendarEntry {
  id: number;
  year: number;
  month: number;
  day: number;
  status: 'on' | 'off' | 'undefined';
  notes: string;
  created_at: string;
  updated_at: string;
  created_by_id: number;
}

export interface SanjoTsubameCalendarInput {
  year: number;
  month: number;
  day: number;
  status: 'on' | 'off' | 'undefined';
  notes?: string;
}

export interface SanjoTsubameBulkImportRequest {
  year: number;
  month: number;
  days: number[];
  status: 'on' | 'off';
}

export interface SanjoTsubameBulkImportResponse {
  message: string;
  created: number;
  updated: number;
}

export const sanjoTsubameCalendarApi = {
  // Get business day status for a specific date
  getDateStatus: async (year: number, month: number, day: number): Promise<SanjoTsubameStatusResponse> => {
    return await apiClient.get(`/api/sanjo-tsubame-calendar/${year}/${month}/${day}`);
  },

  // Get business day status for an entire month
  getMonthStatus: async (year: number, month: number): Promise<SanjoTsubameMonthResponse> => {
    return await apiClient.get(`/api/sanjo-tsubame-calendar/${year}/${month}`);
  },

  // Create or update a calendar entry (admin only)
  createCalendarEntry: async (entry: SanjoTsubameCalendarInput): Promise<SanjoTsubameCalendarEntry> => {
    return await apiClient.post('/api/sanjo-tsubame-calendar', entry);
  },

  // Bulk import calendar entries (admin only)
  bulkImportEntries: async (importData: SanjoTsubameBulkImportRequest): Promise<SanjoTsubameBulkImportResponse> => {
    return await apiClient.post('/api/sanjo-tsubame-calendar/bulk-import', importData);
  },

  // Utility function to get current month status
  getCurrentMonthStatus: async (): Promise<SanjoTsubameMonthResponse> => {
    const now = new Date();
    return sanjoTsubameCalendarApi.getMonthStatus(now.getFullYear(), now.getMonth() + 1);
  },

  // Utility function to check if today is a business day
  getTodayStatus: async (): Promise<SanjoTsubameStatusResponse> => {
    const now = new Date();
    return sanjoTsubameCalendarApi.getDateStatus(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate()
    );
  },
};