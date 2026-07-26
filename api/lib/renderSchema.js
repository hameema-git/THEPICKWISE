const SITE_URL = 'https://thepickwise.in'

// Mirrors src/components/Seo.jsx's schema block exactly, including the
// availability-by-status mapping (out_of_stock/discontinued/active) added
// alongside the Product Status feature — bots should see the same accurate
// availability data real visitors' browsers set client-side.
export function renderProductSchema(product, path) {
  const url = `${SITE_URL}${path}`

  const availability = {
    out_of_stock: 'https://schema.org/OutOfStock',
    discontinued: 'https://schema.org/Discontinued',
  }[product.status] || 'https://schema.org/InStock'

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.image_url,
    description: product.review_summary || product.review,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'INR',
      price: (product.price || '').replace(/[^0-9.]/g, '') || undefined,
      availability,
    },
    ...(product.rating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviews_count || 1,
      },
    } : {}),
  }

  // JSON.stringify handles its own escaping; </script> inside a JSON string
  // value could still prematurely close the tag in an HTML parser, so guard
  // against that specifically.
  const json = JSON.stringify(schema).replace(/</g, '\\u003c')
  return `<script type="application/ld+json">${json}</script>`
}
