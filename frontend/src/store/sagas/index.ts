import { all } from 'redux-saga/effects'
import { blogSaga } from './blogSaga'
import { iotSaga } from './iotSaga'
import { eventsSaga } from './eventsSaga'
import { sanjoTsubameCalendarSaga } from './sanjoTsubameCalendarSaga'

export default function* rootSaga() {
  yield all([
    blogSaga(),
    iotSaga(),
    eventsSaga(),
    sanjoTsubameCalendarSaga(),
  ])
}