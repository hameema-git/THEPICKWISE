import { validateProductForm } from './productValidation.js'

const FIELD_ALIASES = {
  name: ['name', 'product_name', 'title'],
  price: ['price', 'sale_price', 'current_price'],
  original_price: ['original_price', 'mrp', 'list_price', 'regular_price'],
  savings: ['savings', 'discount', 'discount_text'],
  shop: ['shop', 'store', 'retailer', 'merchant'],
  rating: ['rating', 'average_rating'],
  reviews_count: ['reviews_count', 'review_count', 'ratings_count'],
  affiliate_link: ['affiliate_link', 'product_url', 'url', 'buy_link'],
  image_url: ['image_url', 'image', 'thumbnail'],
  image_urls: ['image_urls', 'images', 'photos'],
  review: ['review', 'description', 'experience'],
  review_summary: ['review_summary', 'summary', 'short_description'],
  review_pros: ['review_pros', 'pros'],
  review_cons: ['review_cons', 'cons'],
  review_verdict: ['review_verdict', 'verdict'],
  video_link_youtube: ['video_link_youtube', 'youtube_url', 'youtube'],
  video_link_instagram: ['video_link_instagram', 'instagram_url', 'instagram'],
  video_credit: ['video_credit', 'video_creator'],
  badges: ['badges', 'tags'],
  seo_title: ['seo_title', 'meta_title'],
  seo_description: ['seo_description', 'meta_description'],
  seo_keywords: ['seo_keywords', 'keywords'],
  category: ['category', 'category_name'],
}

const normalise = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean).map(String) : (value ? [String(value)] : [])

const asNumber = (value) => {
  if (typeof value === 'number') return value
  const number = Number(String(value ?? '').replace(/[^\d.-]/g, ''))
  return Number.isFinite(number) ? number : value
}

export function getCategoryMatch(categoryName, categories) {
  const target = normalise(categoryName)
  if (!target) return null
  const exact = categories.find((category) => normalise(category.name) === target)
  if (exact) return { category: exact, exact: true }
  const suggestion = categories.find((category) => normalise(category.name).includes(target) || target.includes(normalise(category.name)))
  return suggestion ? { category: suggestion, exact: false } : null
}

export function parseProductImport(rawJson, categories) {
  let source
  try {
    source = JSON.parse(rawJson)
  } catch (error) {
    return { errors: [`Invalid JSON: ${error.message}`], warnings: [], product: null, importedFields: [], categoryName: '' }
  }

  if (!source || Array.isArray(source) || typeof source !== 'object') {
    return { errors: ['Paste one product as a JSON object, not a list or a value.'], warnings: [], product: null, importedFields: [], categoryName: '' }
  }

  const product = {}
  const importedFields = []
  const usedKeys = new Set()
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    const key = aliases.find((alias) => source[alias] !== undefined && source[alias] !== null && source[alias] !== '')
    if (!key) continue
    usedKeys.add(key)
    if (field === 'category') continue
    let value = source[key]
    if (['price', 'original_price', 'rating', 'reviews_count'].includes(field)) value = asNumber(value)
    if (['image_urls', 'review_pros', 'review_cons', 'badges'].includes(field)) value = asArray(value)
    product[field] = value
    importedFields.push(field)
  }

  if (product.image_urls?.length && !product.image_url) product.image_url = product.image_urls[0]
  if (product.image_url && !product.image_urls?.length) product.image_urls = [String(product.image_url)]

  const categoryKey = FIELD_ALIASES.category.find((key) => source[key])
  const categoryName = categoryKey ? String(source[categoryKey]).trim() : ''
  if (categoryKey) usedKeys.add(categoryKey)
  const warnings = Object.keys(source)
    .filter((key) => !usedKeys.has(key))
    .map((key) => `“${key}” was not imported because PickWise does not use that field.`)

  const validationErrors = validateProductForm({
    name: product.name || '', price: product.price ?? '', original_price: product.original_price ?? '',
    rating: product.rating ?? '', reviews_count: product.reviews_count ?? '', affiliate_link: product.affiliate_link || '',
    video_link_youtube: product.video_link_youtube || '', video_link_instagram: product.video_link_instagram || '',
  })
  // Importing is allowed to be incremental. Only validate values the JSON
  // actually provides; the product form remains responsible for checking all
  // required fields when the creator saves or publishes the product.
  const errors = Object.entries(validationErrors)
    .filter(([field]) => importedFields.includes(field))
    .map(([, message]) => message)

  if (importedFields.length === 0 && !categoryName) {
    errors.push('No supported product fields were found in this JSON.')
  }

  return { errors, warnings, product, importedFields, categoryName, categoryMatch: getCategoryMatch(categoryName, categories) }
}

export const PRODUCT_IMPORT_PROMPT = `Generate one valid JSON object for a PickWise product import.\n\nUse these fields where available:\nname, category, price, original_price, savings, shop, rating, reviews_count, affiliate_link, image_urls, review_summary, review, review_pros, review_cons, review_verdict, youtube_url, instagram_url, badges, seo_title, seo_description, seo_keywords.\n\nRules:\n- name is required and must be 200 characters or fewer.\n- price must be a number, without a currency symbol.\n- original_price must be a number greater than or equal to price.\n- affiliate_link and all image URLs must use HTTPS.\n- image_urls, review_pros, review_cons, and badges must be JSON arrays.\n- Include a category name that matches an existing PickWise category when possible.\n- Return JSON only; do not wrap it in Markdown.`
