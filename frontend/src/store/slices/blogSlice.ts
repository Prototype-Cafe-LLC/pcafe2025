import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BlogPost {
  id: string
  title: string
  content: string
  tags: string[]
  slug: string
  published: boolean
  createdAt: string
  updatedAt: string
}

interface BlogState {
  posts: BlogPost[]
  selectedPost: BlogPost | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
  }
  filters: {
    tag?: string
    published?: boolean
  }
}

const initialState: BlogState = {
  posts: [],
  selectedPost: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  filters: {}
}

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    fetchPostsStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchPostsSuccess: (state, action: PayloadAction<{
      posts: BlogPost[]
      pagination: { page: number; limit: number; total: number }
    }>) => {
      state.loading = false
      state.posts = action.payload.posts
      state.pagination = action.payload.pagination
      state.error = null
    },
    fetchPostsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    selectPost: (state, action: PayloadAction<BlogPost>) => {
      state.selectedPost = action.payload
    },
    clearSelectedPost: (state) => {
      state.selectedPost = null
    },
    addPost: (state, action: PayloadAction<BlogPost>) => {
      state.posts.unshift(action.payload)
    },
    updatePost: (state, action: PayloadAction<BlogPost>) => {
      const index = state.posts.findIndex(post => post.id === action.payload.id)
      if (index !== -1) {
        state.posts[index] = action.payload
      }
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(post => post.id !== action.payload)
    },
    setFilters: (state, action: PayloadAction<{ tag?: string; published?: boolean }>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const {
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  selectPost,
  clearSelectedPost,
  addPost,
  updatePost,
  deletePost,
  setFilters,
  clearFilters,
  clearError
} = blogSlice.actions

export default blogSlice.reducer