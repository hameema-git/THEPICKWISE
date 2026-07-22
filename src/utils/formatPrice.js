// Price is stored as free text (so a creator can type "Free shipping" or
// "$12" for an international product, etc.) — but the common case is
// someone just typing a plain number like "12300". This formats that case
// nicely (₹12,300, Indian-style grouping) while leaving anything that
// already looks intentional (has ₹, $, letters, etc.) untouched.
export function formatPrice(value) {
  if (!value) return ''
  const trimmed = String(value).trim()

  // Already has a currency symbol or non-numeric content — trust it as-is.
  if (!/^[\d,.\s]+$/.test(trimmed)) return trimmed

  const num = Number(trimmed.replace(/,/g, ''))
  if (!Number.isFinite(num)) return trimmed

  return `₹${num.toLocaleString('en-IN')}`
}
