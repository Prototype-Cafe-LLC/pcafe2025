import { all } from 'redux-saga/effects'
import { blogSaga } from './blogSaga'

export default function* rootSaga() {
  yield all([
    blogSaga(),
  ])
}