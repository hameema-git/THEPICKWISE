import { supabase } from '../lib/supabase'

// Called from the public site (Phase 3) right before an affiliate redirect.
export async function logClick(productId) {
  const { error } = await supabase.from('affiliate_clicks').insert([{ product_id: productId }])
  if (error) throw error
}

export async function getTotalClicks() {
  const { count, error } = await supabase
    .from('affiliate_clicks')
    .select('*', { count: 'exact', head: true })
  if (error) throw error
  return count || 0
}

// Supabase's query builder doesn't do GROUP BY directly, so clicks are
// aggregated client-side. Fine at creator scale (hundreds-to-low-thousands
// of rows); if this ever needs to scale further, a Postgres view or RPC
// function would be the next step rather than pulling every row here.
export async function getMostClickedProducts(limit = 5) {
  const { data: clicks, error } = await supabase
    .from('affiliate_clicks')
    .select('product_id')
  if (error) throw error

  const counts = {}
  for (const c of clicks) counts[c.product_id] = (counts[c.product_id] || 0) + 1

  const topIds = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  if (topIds.length === 0) return []

  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, image_url')
    .in('id', topIds)
  if (prodError) throw prodError

  return topIds
    .map((id) => {
      const product = products.find((p) => p.id === id)
      return product ? { ...product, clicks: counts[id] } : null
    })
    .filter(Boolean)
}

export async function getTopCategories(limit = 5) {
  const { data: products, error } = await supabase
    .from('products')
    .select('category_id, categories(name, emoji)')
    .eq('is_published', true)
  if (error) throw error

  const counts = {}
  for (const p of products) {
    if (!p.category_id) continue
    const key = p.category_id
    if (!counts[key]) counts[key] = { count: 0, name: p.categories?.name, emoji: p.categories?.emoji }
    counts[key].count += 1
  }

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
