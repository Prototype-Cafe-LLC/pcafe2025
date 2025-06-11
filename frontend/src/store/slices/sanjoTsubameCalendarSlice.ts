import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  SanjoTsubameStatusResponse, 
  SanjoTsubameMonthResponse,
  SanjoTsubameCalendarEntry 
} from '../../services/sanjoTsubameCalendar';

export interface SanjoTsubameCalendarState {
  // Current month calendar data
  currentMonth: SanjoTsubameMonthResponse | null;
  
  // Today's status
  todayStatus: SanjoTsubameStatusResponse | null;
  
  // Loading states
  loading: {
    monthData: boolean;
    todayStatus: boolean;
    creating: boolean;
    bulkImporting: boolean;
  };
  
  // Error states
  error: {
    monthData: string | null;
    todayStatus: string | null;
    creating: string | null;
    bulkImporting: string | null;
  };
  
  // UI state
  selectedDate: {
    year: number;
    month: number;
    day: number;
  } | null;
  
  // Admin state
  lastCreatedEntry: SanjoTsubameCalendarEntry | null;
}

const initialState: SanjoTsubameCalendarState = {
  currentMonth: null,
  todayStatus: null,
  loading: {
    monthData: false,
    todayStatus: false,
    creating: false,
    bulkImporting: false,
  },
  error: {
    monthData: null,
    todayStatus: null,
    creating: null,
    bulkImporting: null,
  },
  selectedDate: null,
  lastCreatedEntry: null,
};

const sanjoTsubameCalendarSlice = createSlice({
  name: 'sanjoTsubameCalendar',
  initialState,
  reducers: {
    // Month data actions
    fetchMonthDataStart: (state, _action: PayloadAction<{ year: number; month: number }>) => {
      state.loading.monthData = true;
      state.error.monthData = null;
    },
    fetchMonthDataSuccess: (state, action: PayloadAction<SanjoTsubameMonthResponse>) => {
      state.loading.monthData = false;
      state.currentMonth = action.payload;
      state.error.monthData = null;
    },
    fetchMonthDataFailure: (state, action: PayloadAction<string>) => {
      state.loading.monthData = false;
      state.error.monthData = action.payload;
    },

    // Today status actions
    fetchTodayStatusStart: (state) => {
      state.loading.todayStatus = true;
      state.error.todayStatus = null;
    },
    fetchTodayStatusSuccess: (state, action: PayloadAction<SanjoTsubameStatusResponse>) => {
      state.loading.todayStatus = false;
      state.todayStatus = action.payload;
      state.error.todayStatus = null;
    },
    fetchTodayStatusFailure: (state, action: PayloadAction<string>) => {
      state.loading.todayStatus = false;
      state.error.todayStatus = action.payload;
    },

    // Create entry actions
    createEntryStart: (state) => {
      state.loading.creating = true;
      state.error.creating = null;
    },
    createEntrySuccess: (state, action: PayloadAction<SanjoTsubameCalendarEntry>) => {
      state.loading.creating = false;
      state.lastCreatedEntry = action.payload;
      state.error.creating = null;
      
      // Update current month data if the created entry is in the current month
      if (state.currentMonth && 
          state.currentMonth.year === action.payload.year && 
          state.currentMonth.month === action.payload.month) {
        const dateKey = `${action.payload.year}-${String(action.payload.month).padStart(2, '0')}-${String(action.payload.day).padStart(2, '0')}`;
        state.currentMonth.data[dateKey] = action.payload.status;
      }
    },
    createEntryFailure: (state, action: PayloadAction<string>) => {
      state.loading.creating = false;
      state.error.creating = action.payload;
    },

    // Bulk import actions
    bulkImportStart: (state) => {
      state.loading.bulkImporting = true;
      state.error.bulkImporting = null;
    },
    bulkImportSuccess: (state, _action: PayloadAction<{ importData: any; result: any }>) => {
      state.loading.bulkImporting = false;
      state.error.bulkImporting = null;
      
      // Refresh current month data after bulk import
      // The saga should trigger a refresh
    },
    bulkImportFailure: (state, action: PayloadAction<string>) => {
      state.loading.bulkImporting = false;
      state.error.bulkImporting = action.payload;
    },

    // UI actions
    setSelectedDate: (state, action: PayloadAction<{ year: number; month: number; day: number } | null>) => {
      state.selectedDate = action.payload;
    },

    // Clear errors
    clearErrors: (state) => {
      state.error = {
        monthData: null,
        todayStatus: null,
        creating: null,
        bulkImporting: null,
      };
    },

    // Clear state
    clearCalendarData: (state) => {
      state.currentMonth = null;
      state.selectedDate = null;
    },
  },
});

export const {
  fetchMonthDataStart,
  fetchMonthDataSuccess,
  fetchMonthDataFailure,
  fetchTodayStatusStart,
  fetchTodayStatusSuccess,
  fetchTodayStatusFailure,
  createEntryStart,
  createEntrySuccess,
  createEntryFailure,
  bulkImportStart,
  bulkImportSuccess,
  bulkImportFailure,
  setSelectedDate,
  clearErrors,
  clearCalendarData,
} = sanjoTsubameCalendarSlice.actions;

export default sanjoTsubameCalendarSlice.reducer;