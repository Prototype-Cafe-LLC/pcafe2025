export interface SEOData {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  tags?: string[]
}

export function updatePageSEO(data: SEOData) {
  // Update document title
  if (data.title) {
    document.title = `${data.title} | PCafe 2025`
  }

  // Update meta tags
  updateMetaTag('description', data.description)
  updateMetaTag('author', data.author)

  // Open Graph meta tags
  updateMetaProperty('og:title', data.title)
  updateMetaProperty('og:description', data.description)
  updateMetaProperty('og:url', data.url)
  updateMetaProperty('og:type', data.type || 'website')
  updateMetaProperty('og:image', data.image)
  updateMetaProperty('og:site_name', 'PCafe 2025')

  // Twitter meta tags
  updateMetaName('twitter:card', 'summary_large_image')
  updateMetaName('twitter:title', data.title)
  updateMetaName('twitter:description', data.description)
  updateMetaName('twitter:image', data.image)

  // Article specific meta tags
  if (data.type === 'article') {
    updateMetaProperty('article:published_time', data.publishedTime)
    updateMetaProperty('article:modified_time', data.modifiedTime)
    updateMetaProperty('article:author', data.author)
    
    // Remove existing article:tag meta tags
    removeMetaProperties('article:tag')
    
    // Add new article:tag meta tags
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tag => {
        addMetaProperty('article:tag', tag)
      })
    }
  }

  // JSON-LD structured data
  if (data.type === 'article') {
    updateStructuredData({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: data.title,
      description: data.description,
      image: data.image,
      url: data.url,
      datePublished: data.publishedTime,
      dateModified: data.modifiedTime,
      author: {
        '@type': 'Person',
        name: data.author
      },
      publisher: {
        '@type': 'Organization',
        name: 'PCafe 2025',
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/logo.png`
        }
      },
      keywords: data.tags?.join(', ')
    })
  }
}

function updateMetaTag(name: string, content?: string) {
  if (!content) return

  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = name
    document.head.appendChild(meta)
  }
  meta.content = content
}

function updateMetaProperty(property: string, content?: string) {
  if (!content) return

  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('property', property)
    document.head.appendChild(meta)
  }
  meta.content = content
}

function updateMetaName(name: string, content?: string) {
  if (!content) return

  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = name
    document.head.appendChild(meta)
  }
  meta.content = content
}

function addMetaProperty(property: string, content: string) {
  const meta = document.createElement('meta')
  meta.setAttribute('property', property)
  meta.content = content
  document.head.appendChild(meta)
}

function removeMetaProperties(property: string) {
  const metas = document.querySelectorAll(`meta[property="${property}"]`)
  metas.forEach(meta => meta.remove())
}

function updateStructuredData(data: Record<string, unknown>) {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]')
  if (existingScript) {
    existingScript.remove()
  }

  // Add new structured data
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

export function resetPageSEO() {
  // Reset to default title
  document.title = 'PCafe 2025 - IoT Innovation Hub'

  // Remove dynamic meta tags
  const metasToRemove = [
    'meta[property^="og:"]',
    'meta[property^="article:"]',
    'meta[name^="twitter:"]',
    'script[type="application/ld+json"]'
  ]

  metasToRemove.forEach(selector => {
    const elements = document.querySelectorAll(selector)
    elements.forEach(element => element.remove())
  })

  // Set default meta tags
  updateMetaTag('description', 'PCafe 2025 - Discover the latest in IoT technology, events, and innovations. Join our community of engineers and tech enthusiasts.')
  updateMetaProperty('og:title', 'PCafe 2025 - IoT Innovation Hub')
  updateMetaProperty('og:description', 'PCafe 2025 - Discover the latest in IoT technology, events, and innovations. Join our community of engineers and tech enthusiasts.')
  updateMetaProperty('og:type', 'website')
  updateMetaProperty('og:url', window.location.href)
}