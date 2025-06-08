import { useEffect, useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useSearchParams } from 'react-router-dom'
import { RootState } from '../store'
import { fetchPostsRequest } from '../store/sagas/blogSaga'
import { updatePageSEO, resetPageSEO } from '../utils/seo'
import styles from './BlogPage.module.css'

export function BlogPage() {
  const dispatch = useDispatch()
  const { posts, loading, error } = useSelector((state: RootState) => state.blog)
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(searchParams.get('featured') === 'true')

  useEffect(() => {
    // Build filter params for API call
    const params = {
      published: true,
      search: searchParams.get('search') || undefined,
      tags: searchParams.get('tag') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
    }
    
    // Remove undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    )
    
    dispatch(fetchPostsRequest(cleanParams))
    
    // Set SEO for blog listing page
    updatePageSEO({
      title: 'Blog - Latest IoT Insights and Developments',
      description: 'Discover the latest insights, developments, and innovations in IoT technology. Read expert articles, technical guides, and industry updates from PCafe 2025.',
      url: window.location.href,
      type: 'website'
    })

    return () => {
      resetPageSEO()
    }
  }, [dispatch, searchParams])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (selectedTag) params.set('tag', selectedTag)
    if (showFeaturedOnly) params.set('featured', 'true')
    
    setSearchParams(params)
  }, [searchTerm, selectedTag, showFeaturedOnly, setSearchParams])

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    if (!posts || !Array.isArray(posts)) {
      return []
    }
    let filtered = posts.filter(post => post.is_published)

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        post.plain_text?.toLowerCase().includes(term) ||
        post.tags.some(tag => tag.toLowerCase().includes(term))
      )
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter(post => post.tags.includes(selectedTag))
    }

    // Featured filter
    if (showFeaturedOnly) {
      filtered = filtered.filter(post => post.is_featured)
    }

    return filtered
  }, [posts, searchTerm, selectedTag, showFeaturedOnly])

  // Get all unique tags for filter dropdown
  const allTags = useMemo(() => {
    if (!posts || !Array.isArray(posts)) {
      return []
    }
    const tags = new Set<string>()
    posts.forEach(post => {
      if (post.is_published) {
        post.tags.forEach(tag => tags.add(tag))
      }
    })
    return Array.from(tags).sort()
  }, [posts])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading blog posts...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.subtitle}>
          Latest insights, developments, and innovations in IoT technology
        </p>
      </header>

      <div className={styles.filters}>
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterSection}>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className={styles.tagSelect}
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <label className={styles.featuredCheckbox}>
            <input
              type="checkbox"
              checked={showFeaturedOnly}
              onChange={(e) => setShowFeaturedOnly(e.target.checked)}
            />
            Featured Only
          </label>

          {(searchTerm || selectedTag || showFeaturedOnly) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedTag('')
                setShowFeaturedOnly(false)
              }}
              className={styles.clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className={styles.resultsCount}>
          {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} found
        </div>
      </div>

      <div className={styles.content}>
        {filteredPosts.length === 0 ? (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>
              {(!posts || posts.filter(p => p.is_published).length === 0)
                ? 'No Blog Posts Yet'
                : 'No Posts Match Your Search'
              }
            </h2>
            <p className={styles.emptyText}>
              {(!posts || posts.filter(p => p.is_published).length === 0)
                ? 'Check back soon for the latest IoT insights and developments.'
                : 'Try adjusting your search terms or filters.'
              }
            </p>
          </div>
        ) : (
          <div className={styles.postsGrid}>
            {filteredPosts.map((post) => (
              <article key={post.id} className={styles.postCard}>
                <div className={styles.postMeta}>
                  <time className={styles.postDate}>
                    {new Date(post.published_at || post.created_at).toLocaleDateString()}
                  </time>
                  {post.reading_time && (
                    <span className={styles.readingTime}>
                      {post.reading_time} min read
                    </span>
                  )}
                </div>
                
                <h2 className={styles.postTitle}>
                  <Link to={`/blog/${post.slug}`} className={styles.postLink}>
                    {post.title}
                  </Link>
                </h2>
                
                {post.tags.length > 0 && (
                  <div className={styles.tags}>
                    {post.tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className={styles.postExcerpt}>
                  {post.excerpt || post.plain_text?.substring(0, 150) + '...' || 'No excerpt available'}
                </div>
                
                <Link to={`/blog/${post.slug}`} className={styles.readMore}>
                  Read more →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}