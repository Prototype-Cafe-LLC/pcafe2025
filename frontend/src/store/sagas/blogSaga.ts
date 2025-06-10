import { call, put, takeLatest, takeEvery } from 'redux-saga/effects'
import { createAction } from '@reduxjs/toolkit'
import { blogService, BlogListParams, BlogPost } from '../../services/blog'
import {
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  fetchPostStart,
  fetchPostSuccess,
  fetchPostFailure,
} from '../slices/blogSlice'

// Action creators for saga triggers
export const fetchPostsRequest = createAction<BlogListParams | undefined>('blog/fetchPostsRequest')
export const fetchPostRequest = createAction<string | number>('blog/fetchPostRequest')

// Saga workers
function* fetchPostsSaga(action: ReturnType<typeof fetchPostsRequest>) {
  try {
    yield put(fetchPostsStart())
    const posts: BlogPost[] = yield call(blogService.fetchPosts, action.payload || {})
    yield put(fetchPostsSuccess(posts))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch posts'
    yield put(fetchPostsFailure(errorMessage))
  }
}

function* fetchPostSaga(action: ReturnType<typeof fetchPostRequest>) {
  try {
    yield put(fetchPostStart())
    const post: BlogPost = yield call(blogService.fetchPost, action.payload)
    yield put(fetchPostSuccess(post))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch post'
    yield put(fetchPostFailure(errorMessage))
  }
}

// Root blog saga
export function* blogSaga() {
  yield takeLatest(fetchPostsRequest.type, fetchPostsSaga)
  yield takeEvery(fetchPostRequest.type, fetchPostSaga)
}