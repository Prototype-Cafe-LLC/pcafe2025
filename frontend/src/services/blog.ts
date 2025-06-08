import { apiClient } from './api'

export interface BlogPost {
  id: number
  title: string
  slug: string
  content: string
  content_type: string
  excerpt: string
  meta_title?: string
  meta_description?: string
  tags: string[]
  is_published: boolean
  is_featured: boolean
  published_at?: string
  view_count: number
  author_id?: number
  author?: {
    id: number
    username: string
    email: string
  }
  processed_content?: string
  plain_text?: string
  reading_time?: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface BlogListResponse {
  posts: BlogPost[]
  total: number
  page: number
  limit: number
  has_next: boolean
  has_prev: boolean
}

export interface BlogListParams {
  page?: number
  limit?: number
  search?: string
  tags?: string
  featured?: boolean
  published?: boolean
}

export interface CreateBlogPostData {
  title: string
  content: string
  content_type?: string
  meta_title?: string
  meta_description?: string
  tags?: string[]
  is_published?: boolean
  is_featured?: boolean
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: number
}

class BlogService {
  private readonly basePath = '/api/blog'

  /**
   * Fetch all blog posts with optional filtering and pagination
   */
  async fetchPosts(params: BlogListParams = {}): Promise<BlogListResponse> {
    const queryParams: Record<string, string | number | boolean> = {}
    
    if (params.page !== undefined) queryParams.page = params.page
    if (params.limit !== undefined) queryParams.limit = params.limit
    if (params.search) queryParams.search = params.search
    if (params.tags) queryParams.tags = params.tags
    if (params.featured !== undefined) queryParams.featured = params.featured
    if (params.published !== undefined) queryParams.published = params.published

    return apiClient.get<BlogListResponse>(this.basePath, queryParams)
  }

  /**
   * Fetch a single blog post by ID or slug
   */
  async fetchPost(idOrSlug: string | number): Promise<BlogPost> {
    return apiClient.get<BlogPost>(`${this.basePath}/${idOrSlug}`)
  }

  /**
   * Fetch all unique tags
   */
  async fetchTags(): Promise<string[]> {
    return apiClient.get<string[]>(`${this.basePath}/tags`)
  }

  /**
   * Create a new blog post (admin only)
   */
  async createPost(data: CreateBlogPostData): Promise<BlogPost> {
    return apiClient.post<BlogPost>(this.basePath, data)
  }

  /**
   * Update an existing blog post (admin only)
   */
  async updatePost(data: UpdateBlogPostData): Promise<BlogPost> {
    const { id, ...updateData } = data
    return apiClient.put<BlogPost>(`${this.basePath}/${id}`, updateData)
  }

  /**
   * Delete a blog post (admin only)
   */
  async deletePost(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${id}`)
  }
}

const blogServiceInstance = new BlogService()

export const blogService = {
  fetchPosts: (params?: BlogListParams) => blogServiceInstance.fetchPosts(params),
  fetchPost: (idOrSlug: string | number) => blogServiceInstance.fetchPost(idOrSlug),
  fetchTags: () => blogServiceInstance.fetchTags(),
  createPost: (data: CreateBlogPostData) => blogServiceInstance.createPost(data),
  updatePost: (data: UpdateBlogPostData) => blogServiceInstance.updatePost(data),
  deletePost: (id: number) => blogServiceInstance.deletePost(id),
}