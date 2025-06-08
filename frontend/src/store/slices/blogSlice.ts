import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BlogPost {
  id: number
  title: string
  slug: string
  content: string
  tags: string[]
  published: boolean
  createdAt: string
  updatedAt: string
}

interface BlogState {
  posts: BlogPost[]
  selectedPost: BlogPost | null
  loading: boolean
  error: string | null
}

const initialState: BlogState = {
  posts: [],
  selectedPost: null,
  loading: false,
  error: null,
}

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    fetchPostsStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchPostsSuccess: (state, action: PayloadAction<BlogPost[]>) => {
      state.loading = false
      state.posts = action.payload
      state.error = null
    },
    fetchPostsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    fetchPostStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchPostSuccess: (state, action: PayloadAction<BlogPost>) => {
      state.loading = false
      state.selectedPost = action.payload
      state.error = null
    },
    fetchPostFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    clearSelectedPost: (state) => {
      state.selectedPost = null
    },
    addPost: (state, action: PayloadAction<BlogPost>) => {
      state.posts.push(action.payload)
    },
    updatePost: (state, action: PayloadAction<BlogPost>) => {
      const index = state.posts.findIndex(post => post.id === action.payload.id)
      if (index !== -1) {
        state.posts[index] = action.payload
      }
    },
    deletePost: (state, action: PayloadAction<number>) => {
      state.posts = state.posts.filter(post => post.id !== action.payload)
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  fetchPostStart,
  fetchPostSuccess,
  fetchPostFailure,
  clearSelectedPost,
  addPost,
  updatePost,
  deletePost,
  clearError,
} = blogSlice.actions

export default blogSlice.reducer