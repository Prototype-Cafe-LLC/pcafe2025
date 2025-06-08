import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState } from '../store'
import { fetchPostsStart } from '../store/slices/blogSlice'
import styles from './BlogPage.module.css'

export function BlogPage() {
  const dispatch = useDispatch()
  const { posts, loading, error } = useSelector((state: RootState) => state.blog)

  useEffect(() => {
    dispatch(fetchPostsStart())
  }, [dispatch])

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

  const publishedPosts = posts.filter(post => post.published)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.subtitle}>
          Latest insights, developments, and innovations in IoT technology
        </p>
      </header>

      <div className={styles.content}>
        {publishedPosts.length === 0 ? (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>No Blog Posts Yet</h2>
            <p className={styles.emptyText}>
              Check back soon for the latest IoT insights and developments.
            </p>
          </div>
        ) : (
          <div className={styles.postsGrid}>
            {publishedPosts.map((post) => (
              <article key={post.id} className={styles.postCard}>
                <div className={styles.postMeta}>
                  <time className={styles.postDate}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </time>
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
                  {/* Show first 150 characters of content without HTML */}
                  {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
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