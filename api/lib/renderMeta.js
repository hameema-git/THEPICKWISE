const SITE_URL = 'https://thepickwise.in'
const DEFAULT_IMAGE = `${SITE_URL}/icon-512.svg`

// Escapes text going into HTML attributes/content — this is server-rendered
// from creator-entered data (product names, reviews), so it needs the same
// basic escaping any server-rendered HTML would need.
function esc(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Mirrors src/components/Seo.jsx's title-suffix rule exactly: a custom
// seo_title is used as-is (no forced suffix), an auto-generated one
// (product name) gets " | thePickWise" appended, same as what real
// visitors' browsers end up showing via document.title.
function buildTitle(product) {
  if (product.seo_title) return product.seo_title
  return `${product.name} | thePickWise`
}

function buildDescription(product) {
  const raw = product.seo_description || product.review_summary || product.review || ''
  return raw.slice(0, 155)
}

export function renderMetaTags(product, path) {
  const title = buildTitle(product)
  const description = buildDescription(product)
  const url = `${SITE_URL}${path}`
  const image = product.image_url || DEFAULT_IMAGE

  return `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    ${product.seo_keywords ? `<meta name="keywords" content="${esc(product.seo_keywords)}">` : ''}
    <link rel="canonical" href="${esc(url)}">

    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${esc(url)}">
    <meta property="og:image" content="${esc(image)}">
    <meta property="og:type" content="product">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${esc(image)}">
  `.trim()
}

export { esc }
