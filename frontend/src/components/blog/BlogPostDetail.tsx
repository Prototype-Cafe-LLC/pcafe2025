import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { RootState } from '../../store'
import { clearSelectedPost } from '../../store/slices/blogSlice'
import { fetchPostRequest } from '../../store/sagas/blogSaga'
import { updatePageSEO, resetPageSEO } from '../../utils/seo'
import styles from './BlogPostDetail.module.css'

export function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>()
  const dispatch = useDispatch()
  const { selectedPost, loading, error } = useSelector((state: RootState) => state.blog)

  useEffect(() => {
    if (slug) {
      dispatch(fetchPostRequest(slug))
    }

    return () => {
      dispatch(clearSelectedPost())
      resetPageSEO()
    }
  }, [dispatch, slug])

  // Update SEO when post loads
  useEffect(() => {
    if (selectedPost && !loading) {
      updatePageSEO({
        title: selectedPost.meta_title || selectedPost.title,
        description: selectedPost.meta_description || selectedPost.excerpt,
        url: window.location.href,
        type: 'article',
        publishedTime: selectedPost.published_at,
        modifiedTime: selectedPost.updated_at,
        author: selectedPost.author?.username,
        tags: selectedPost.tags
      })
    }
  }, [selectedPost, loading])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading blog post...</div>
      </div>
    )
  }

  if (error || !selectedPost) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error || 'Blog post not found'}
        </div>
        <Link to="/blog" className={styles.backLink}>
          ← Back to Blog
        </Link>
      </div>
    )
  }

  const post = selectedPost

  const renderContent = () => {
    if (post.content_type === 'html' && post.processed_content) {
      return (
        <div 
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: post.processed_content }}
        />
      )
    }
    
    // Default to markdown rendering
    const content = post.processed_content || post.content
    return (
      <div className={styles.content}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeSanitize]}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  }

  const shareUrl = encodeURIComponent(window.location.href)
  const shareTitle = encodeURIComponent(post.title)

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link to="/blog" className={styles.breadcrumbLink}>
          Blog
        </Link>
        <span className={styles.breadcrumbSeparator}>›</span>
        <span className={styles.breadcrumbCurrent}>{post.title}</span>
      </nav>

      <article className={styles.article}>
        <header className={styles.header}>
          <h1 className={styles.title}>{post.title}</h1>
          
          <div className={styles.meta}>
            <time className={styles.date}>
              {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            
            {post.author && (
              <span className={styles.author}>
                by {post.author.username}
              </span>
            )}
            
            {post.reading_time && (
              <span className={styles.readingTime}>
                {post.reading_time} min read
              </span>
            )}
            
            <span className={styles.views}>
              {post.view_count} views
            </span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className={styles.tags}>
              {post.tags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className={styles.tag}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {renderContent()}

        <footer className={styles.footer}>
          <div className={styles.sharing}>
            <h3 className={styles.sharingTitle}>Share this post</h3>
            <div className={styles.shareButtons}>
              <a
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareButton}
              >
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareButton}
              >
                Facebook
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareButton}
              >
                LinkedIn
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  // You could show a toast notification here
                }}
                className={styles.shareButton}
              >
                Copy Link
              </button>
            </div>
          </div>

          <div className={styles.navigation}>
            <Link to="/blog" className={styles.backLink}>
              ← Back to Blog
            </Link>
          </div>
        </footer>
      </article>
    </div>
  )
}