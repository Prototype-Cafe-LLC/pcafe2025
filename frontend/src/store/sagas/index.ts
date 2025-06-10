import { all } from 'redux-saga/effects'
import { blogSaga } from './blogSaga'
import { iotSaga } from './iotSaga'

export default function* rootSaga() {
  yield all([
    blogSaga(),
    iotSaga(),
  ])
}