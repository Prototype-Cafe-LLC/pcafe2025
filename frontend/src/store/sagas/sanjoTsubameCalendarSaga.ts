import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { 
  sanjoTsubameCalendarApi, 
  SanjoTsubameCalendarInput, 
  SanjoTsubameBulkImportRequest,
  SanjoTsubameMonthResponse,
  SanjoTsubameStatusResponse,
  SanjoTsubameCalendarEntry,
  SanjoTsubameBulkImportResponse
} from '../../services/sanjoTsubameCalendar';
import {
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
} from '../slices/sanjoTsubameCalendarSlice';

// Fetch month data saga
function* fetchMonthDataSaga(action: PayloadAction<{ year: number; month: number }>) {
  try {
    const { year, month } = action.payload;
    const monthData: SanjoTsubameMonthResponse = yield call(sanjoTsubameCalendarApi.getMonthStatus, year, month);
    yield put(fetchMonthDataSuccess(monthData));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch month data';
    yield put(fetchMonthDataFailure(errorMessage));
  }
}

// Fetch today status saga
function* fetchTodayStatusSaga() {
  try {
    const todayStatus: SanjoTsubameStatusResponse = yield call(sanjoTsubameCalendarApi.getTodayStatus);
    yield put(fetchTodayStatusSuccess(todayStatus));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch today status';
    yield put(fetchTodayStatusFailure(errorMessage));
  }
}

// Create entry saga
function* createEntrySaga(action: PayloadAction<SanjoTsubameCalendarInput>) {
  try {
    const entry: SanjoTsubameCalendarEntry = yield call(sanjoTsubameCalendarApi.createCalendarEntry, action.payload);
    yield put(createEntrySuccess(entry));
    
    // Refresh month data after creating entry
    yield put(fetchMonthDataStart({ year: action.payload.year, month: action.payload.month }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create calendar entry';
    yield put(createEntryFailure(errorMessage));
  }
}

// Bulk import saga
function* bulkImportSaga(action: PayloadAction<SanjoTsubameBulkImportRequest>) {
  try {
    const result: SanjoTsubameBulkImportResponse = yield call(sanjoTsubameCalendarApi.bulkImportEntries, action.payload);
    yield put(bulkImportSuccess({ importData: action.payload, result }));
    
    // Refresh month data after bulk import
    yield put(fetchMonthDataStart({ year: action.payload.year, month: action.payload.month }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to bulk import entries';
    yield put(bulkImportFailure(errorMessage));
  }
}

// Root saga
export function* sanjoTsubameCalendarSaga() {
  yield takeLatest(fetchMonthDataStart.type, fetchMonthDataSaga);
  yield takeLatest(fetchTodayStatusStart.type, fetchTodayStatusSaga);
  yield takeEvery(createEntryStart.type, createEntrySaga);
  yield takeEvery(bulkImportStart.type, bulkImportSaga);
}