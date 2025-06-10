import { apiClient } from './api'

export interface Event {
  id: number
  title: string
  description: string
  event_url?: string
  image_url?: string
  start_date: string
  end_date?: string
  is_all_day: boolean
  organizer_name: string
  organizer_url?: string
  source_url?: string
  source_type?: string
  extracted_data?: string
  is_published: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface EventListResponse {
  events: Event[]
  total: number
  page: number
  limit: number
  has_next: boolean
  has_prev: boolean
}

export interface EventListParams {
  page?: number
  limit?: number
  search?: string
  published?: boolean
  featured?: boolean
  upcoming?: boolean
}

export interface CreateEventData {
  title: string
  description: string
  event_url?: string
  image_url?: string
  start_date: string
  end_date?: string
  is_all_day?: boolean
  organizer_name: string
  organizer_url?: string
  source_url?: string
  source_type?: string
  extracted_data?: string
  is_published?: boolean
  is_featured?: boolean
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: number
}

export interface ExtractedMetadata {
  title?: string
  description?: string
  image_url?: string
  organizer_name?: string
  organizer_url?: string
  start_date?: string
  end_date?: string
  error?: string
  success: boolean
}

export interface OCRResult {
  extracted_text?: string
  confidence?: number
  error?: string
  success: boolean
}

export interface PDFResult {
  extracted_text?: string
  page_count?: number
  error?: string
  success: boolean
}

class EventService {
  private readonly basePath = '/api/events'

  /**
   * Fetch all events with optional filtering and pagination
   */
  async fetchEvents(params: EventListParams = {}): Promise<Event[]> {
    const queryParams: Record<string, string | number | boolean> = {}
    
    if (params.page !== undefined) queryParams.page = params.page
    if (params.limit !== undefined) queryParams.limit = params.limit
    if (params.search) queryParams.search = params.search
    if (params.published !== undefined) queryParams.published = params.published
    if (params.featured !== undefined) queryParams.featured = params.featured
    if (params.upcoming !== undefined) queryParams.upcoming = params.upcoming

    // For main site, default to published events only
    if (params.published === undefined) {
      queryParams.published = true
    }

    return apiClient.get<Event[]>(this.basePath, queryParams)
  }

  /**
   * Fetch a single event by ID
   */
  async fetchEvent(id: string | number): Promise<Event> {
    return apiClient.get<Event>(`${this.basePath}/${id}`)
  }

  /**
   * Create a new event (admin only)
   */
  async createEvent(data: CreateEventData): Promise<Event> {
    return apiClient.post<Event>(this.basePath, data)
  }

  /**
   * Update an existing event (admin only)
   */
  async updateEvent(data: UpdateEventData): Promise<Event> {
    const { id, ...updateData } = data
    return apiClient.put<Event>(`${this.basePath}/${id}`, updateData)
  }

  /**
   * Delete an event (admin only)
   */
  async deleteEvent(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${id}`)
  }

  /**
   * Extract metadata from URL (admin only)
   */
  async extractMetadata(url: string): Promise<ExtractedMetadata> {
    return apiClient.post<ExtractedMetadata>(`${this.basePath}/extract-metadata`, { url })
  }

  /**
   * Process image OCR (admin only)
   */
  async processImage(imageFile: File): Promise<OCRResult> {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    return fetch(`/api/events/process-image`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    }).then(response => response.json())
  }

  /**
   * Process PDF text extraction (admin only)
   */
  async processPDF(pdfFile: File): Promise<PDFResult> {
    const formData = new FormData()
    formData.append('pdf', pdfFile)
    
    return fetch(`/api/events/process-pdf`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    }).then(response => response.json())
  }
}

const eventServiceInstance = new EventService()

export const eventService = {
  fetchEvents: (params?: EventListParams) => eventServiceInstance.fetchEvents(params),
  fetchEvent: (id: string | number) => eventServiceInstance.fetchEvent(id),
  createEvent: (data: CreateEventData) => eventServiceInstance.createEvent(data),
  updateEvent: (data: UpdateEventData) => eventServiceInstance.updateEvent(data),
  deleteEvent: (id: number) => eventServiceInstance.deleteEvent(id),
  extractMetadata: (url: string) => eventServiceInstance.extractMetadata(url),
  processImage: (imageFile: File) => eventServiceInstance.processImage(imageFile),
  processPDF: (pdfFile: File) => eventServiceInstance.processPDF(pdfFile)
}