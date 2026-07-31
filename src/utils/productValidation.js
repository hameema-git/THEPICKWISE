const isBlank = (value) => String(value ?? '').trim() === ''

const toNumber = (value) => {
  if (typeof value === 'number') return value
  if (isBlank(value)) return NaN
  return Number(String(value).trim())
}

const isValidHttpsUrl = (value, allowedHosts) => {
  try {
    const url = new URL(String(value).trim())
    return url.protocol === 'https:' && (!allowedHosts || allowedHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`)))
  } catch {
    return false
  }
}

const validateName = (name) => {
  if (isBlank(name)) return 'Product name is required.'
  if (String(name).trim().length > 200) return 'Product name must be 200 characters or fewer.'
  return ''
}

const validatePrice = (price) => {
  const number = toNumber(price)
  if (isBlank(price)) return 'Price is required.'
  if (!Number.isFinite(number) || number < 0) return 'Price must be a number greater than or equal to 0.'
  return ''
}

const validateOriginalPrice = (originalPrice, price) => {
  if (isBlank(originalPrice)) return ''
  const originalNumber = toNumber(originalPrice)
  const priceNumber = toNumber(price)
  if (!Number.isFinite(originalNumber)) return 'Original price must be a number.'
  if (Number.isFinite(priceNumber) && originalNumber < priceNumber) return 'Original price must be greater than or equal to the price.'
  return ''
}

const validateRating = (rating) => {
  if (isBlank(rating)) return ''
  const number = toNumber(rating)
  if (!Number.isFinite(number) || number < 0 || number > 5) return 'Rating must be a number between 0 and 5.'
  return ''
}

const validateReviewCount = (reviewCount) => {
  if (isBlank(reviewCount)) return ''
  const number = toNumber(reviewCount)
  if (!Number.isInteger(number) || number < 0) return 'Review count must be a whole number greater than or equal to 0.'
  return ''
}

const validateAffiliateUrl = (url) => {
  if (isBlank(url)) return 'Affiliate link is required.'
  return isValidHttpsUrl(url) ? '' : 'Affiliate link must be a valid HTTPS URL.'
}

const validateYouTubeUrl = (url) => isBlank(url) || isValidHttpsUrl(url, ['youtube.com', 'youtu.be'])
  ? ''
  : 'Enter a valid YouTube HTTPS URL.'

const validateInstagramUrl = (url) => isBlank(url) || isValidHttpsUrl(url, ['instagram.com'])
  ? ''
  : 'Enter a valid Instagram HTTPS URL.'

export function validateProductForm(form) {
  const errors = {
    name: validateName(form.name),
    price: validatePrice(form.price),
    original_price: validateOriginalPrice(form.original_price, form.price),
    rating: validateRating(form.rating),
    reviews_count: validateReviewCount(form.reviews_count),
    affiliate_link: validateAffiliateUrl(form.affiliate_link),
    video_link_youtube: validateYouTubeUrl(form.video_link_youtube),
    video_link_instagram: validateInstagramUrl(form.video_link_instagram),
  }

  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message))
}
