import { supabase } from '../lib/supabase'

const TABLE = 'products'

const PAGE_SIZE = 12

// Studio views (authenticated) see everything, published or not.
export async function getAll({ categoryId = null, search = '', page = 0, published = 'all' } = {}) {
  let query = supabase
    .from(TABLE)
    .select('*, categories(id, name, slug, emoji, color)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (categoryId && categoryId !== 'all') {
    query = query.eq('category_id', categoryId)
  }
  if (search) {
    query = query.ilike('name', `%${search}%`)
  }
  if (published === 'published') {
    query = query.eq('is_published', true)
  } else if (published === 'draft') {
    query = query.eq('is_published', false)
  }

  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error
  return { data, count, hasMore: to + 1 < count }
}

export async function getById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, categories(id, name, slug, emoji, color)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function create(product) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ ...product, price_updated_at: new Date().toISOString() }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function update(id, changes) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePrice(id, priceChanges) {
  return update(id, { ...priceChanges, price_updated_at: new Date().toISOString() })
}

export async function remove(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

export async function duplicate(product) {
  // Strip id/timestamps so Postgres generates fresh ones; mark the copy as a draft.
  const {
    id, created_at, updated_at, categories, ...rest
  } = product
  return create({ ...rest, name: `${rest.name} (Copy)`, is_published: false })
}

export async function togglePublished(id, isPublished) {
  return update(id, { is_published: isPublished })
}

export async function getStats() {
  const { count: total } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })

  const { count: featured } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('is_pick', true)

  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  const { count: staleCount } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .lt('price_updated_at', sixtyDaysAgo)

  return {
    total: total || 0,
    featured: featured || 0,
    priceStale: staleCount || 0,
  }
}

export async function getLatest(limit = 5) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, categories(name, emoji)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}
