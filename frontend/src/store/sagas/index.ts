import { all } from 'redux-saga/effects'
import { watchAuth } from './authSaga'
import { watchEvents } from './eventsSaga'

export default function* rootSaga() {
  yield all([
    watchAuth(),
    watchEvents(),
  ])
}