import { supabase } from '../lib/supabase'

const TABLE = 'products'
const SELECT = '*, categories(id, name, slug, emoji, color), replacement:replacement_product_id(id, name, image_url, price)'

// Always scoped to published rows — this matters even when the creator is
// logged into Studio and browsing the public site in the same browser tab,
// since Supabase's RLS would otherwise let their session see drafts too.
//
// Discontinued products are excluded from listings/grids (they shouldn't
// clutter "All Products"), but NOT excluded from getById — a discontinued
// product's own page stays live so an indexed Google URL doesn't 404. See
// getById below.
export async function getAll({ categoryId = null, search = '', page = 0, pageSize = 24 } = {}) {
  let query = supabase
    .from(TABLE)
    .select(SELECT, { count: 'exact' })
    .eq('is_published', true)
    .neq('status', 'discontinued')
    .order('created_at', { ascending: false })

  if (categoryId && categoryId !== 'all') {
    query = query.eq('category_id', categoryId)
  }
  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const from = page * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error
  return { data, count, hasMore: to + 1 < count }
}

export async function searchSuggestions(search, limit = 6) {
  const query = String(search || '').trim()
  if (!query) return []
  const { data, error } = await supabase.from(TABLE).select('id, name, categories(name)')
    .eq('is_published', true).neq('status', 'discontinued').ilike('name', `%${query}%`)
    .order('name', { ascending: true }).limit(limit)
  if (error) throw error
  return data || []
}

export async function getPicks() {
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT)
    .eq('is_published', true)
    .neq('status', 'discontinued')
    .eq('is_pick', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Deliberately NOT filtering out discontinued products here — a discontinued
// product's page needs to keep loading (not 404) so any SEO value/backlinks
// to it are preserved. The page itself shows a "discontinued" notice instead.
export async function getById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT)
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getRelated(categoryId, excludeId, limit = 4) {
  if (!categoryId) return []
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT)
    .eq('is_published', true)
    .neq('status', 'discontinued')
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .limit(limit)
  if (error) throw error
  return data
}

// Recent clicks (last 30 days), aggregated client-side, joined back to full
// product rows so the result is ready to render with ProductCard directly.
export async function getTrending(limit = 8) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: clicks, error: clickError } = await supabase
    .from('affiliate_clicks')
    .select('product_id')
    .gte('clicked_at', thirtyDaysAgo)
  if (clickError) throw clickError
  if (!clicks || clicks.length === 0) return []

  const counts = {}
  for (const c of clicks) counts[c.product_id] = (counts[c.product_id] || 0) + 1
  const topIds = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id)
  if (topIds.length === 0) return []

  const { data: products, error } = await supabase
    .from(TABLE)
    .select(SELECT)
    .in('id', topIds)
    .eq('is_published', true)
    .neq('status', 'discontinued')
  if (error) throw error

  // Preserve click-count order — the .in() query above doesn't guarantee it.
  return topIds.map((id) => products.find((p) => p.id === id)).filter(Boolean)
}
