import { call, put, takeEvery } from 'redux-saga/effects'
import { PayloadAction } from '@reduxjs/toolkit'
import { IoTService, ChartDataResponse, Device } from '../../services/iot'
import {
  fetchChartDataStart,
  fetchChartDataSuccess,
  fetchChartDataFailure,
  fetchDevicesStart,
  fetchDevicesSuccess,
  fetchDevicesFailure,
} from '../slices/iotSlice'

interface FetchChartDataAction {
  range?: '3d' | '1w' | '1m'
  deviceId?: string
  sensorTypes?: string[]
}

function* fetchChartDataSaga(action: PayloadAction<FetchChartDataAction>) {
  try {
    const { range = '3d', deviceId, sensorTypes } = action.payload || {}
    
    const response: ChartDataResponse = yield call(IoTService.getChartData, {
      range,
      device_id: deviceId,
      sensor_types: sensorTypes,
    })
    
    yield put(fetchChartDataSuccess(response))
  } catch (error) {
    yield put(fetchChartDataFailure(error instanceof Error ? error.message : 'Failed to fetch chart data'))
  }
}

function* fetchDevicesSaga() {
  try {
    const devices: Device[] = yield call(IoTService.getDevices)
    yield put(fetchDevicesSuccess(devices))
  } catch (error) {
    yield put(fetchDevicesFailure(error instanceof Error ? error.message : 'Failed to fetch devices'))
  }
}

// Simplified auto-refresh - will be triggered from the component

export function* iotSaga() {
  yield takeEvery(fetchChartDataStart.type, fetchChartDataSaga)
  yield takeEvery(fetchDevicesStart.type, fetchDevicesSaga)
}