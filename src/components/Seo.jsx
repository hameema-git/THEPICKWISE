import { useEffect } from 'react'

const SITE_URL = 'https://thepickwise.in'
const DEFAULT_IMAGE = `${SITE_URL}/icon-512.svg`

function setMeta(attr, key, value) {
  if (!value) return
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function setLink(rel, href) {
  if (!href) return
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(id, data) {
  let el = document.getElementById(id)
  if (!data) {
    if (el) el.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

/**
 * Sets page-level SEO tags on mount. This runs client-side only — there's no
 * server-side rendering in this stack (plain Vite + React, per project scope),
 * so crawlers that don't execute JavaScript (some social-link unfurlers, in
 * particular) may still see the static tags from index.html instead of these.
 * Google, Bing, and most modern link previews do execute JS and will see this.
 */
export default function Seo({ title, description, path = '/', image, product, rawTitle = false }) {
  useEffect(() => {
    const fullTitle = !title
      ? 'thePickWise – Tested by Me. Trusted for You.'
      : rawTitle ? title : `${title} | thePickWise`
    const url = `${SITE_URL}${path}`
    const img = image || DEFAULT_IMAGE

    document.title = fullTitle
    setMeta('name', 'description', description)
    setLink('canonical', url)

    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', img)
    setMeta('property', 'og:type', product ? 'product' : 'website')

    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', img)

    if (product) {
      setJsonLd('product-schema', {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        image: product.image_url,
        description: product.review,
        offers: {
          '@type': 'Offer',
          url,
          priceCurrency: 'INR',
          price: (product.price || '').replace(/[^0-9.]/g, '') || undefined,
          availability: 'https://schema.org/InStock',
        },
        ...(product.rating ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviews_count || 1,
          },
        } : {}),
      })
    } else {
      setJsonLd('product-schema', null)
    }
  }, [title, description, path, image, product, rawTitle])

  return null
}
