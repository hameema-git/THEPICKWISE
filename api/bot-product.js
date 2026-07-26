import { isBot } from './lib/isBot.js'
import { fetchProduct } from './lib/fetchProduct.js'
import { renderMetaTags, esc } from './lib/renderMeta.js'
import { renderProductSchema } from './lib/renderSchema.js'

const SITE_URL = 'https://thepickwise.in'

function notFoundHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Product not found | thePickWise</title></head>
    <body><p>This product could not be found.</p></body></html>`
}

export default async function handler(req, res) {
  const id = req.query.id

  // Defense in depth — vercel.json's user-agent condition is the primary
  // gate that routes traffic here, but this doesn't hurt if the function
  // is ever hit directly for some other reason.
  const userAgent = req.headers['user-agent'] || ''
  if (!isBot(userAgent)) {
    res.setHeader('Location', `${SITE_URL}/product/${id}`)
    res.status(302).end()
    return
  }

  if (!id) {
    res.status(400).send('Missing product id')
    return
  }

  let product
  try {
    product = await fetchProduct(id)
  } catch (err) {
    console.error('bot-product: failed to fetch product', err)
    res.status(500).send('Something went wrong loading this product.')
    return
  }

  if (!product) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.status(404).send(notFoundHtml())
    return
  }

  const path = `/product/${id}`
  const metaTags = renderMetaTags(product, path)
  const schema = renderProductSchema(product, path)
  const realUrl = `${SITE_URL}${path}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${metaTags}
  ${schema}
</head>
<body>
  <h1>${esc(product.name)}</h1>
  ${product.image_url ? `<img src="${esc(product.image_url)}" alt="${esc(product.name)}" style="max-width:400px">` : ''}
  <p>${esc(product.review_summary || product.review || '')}</p>
  <p>${esc(product.price || '')}</p>
  <p><a href="${esc(realUrl)}">View full product page on thePickWise</a></p>
</body>
</html>`

  // 5 min fresh, then stale-while-revalidate for an hour — keeps bots from
  // hammering Supabase on every crawl while staying reasonably current with
  // Studio edits.
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600')
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send(html)
}
