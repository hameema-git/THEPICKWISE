import { supabase } from '../lib/supabase'

const TABLE = 'products'
const SELECT = '*, categories(id, name, slug, emoji, color)'

// Always scoped to published rows — this matters even when the creator is
// logged into Studio and browsing the public site in the same browser tab,
// since Supabase's RLS would otherwise let their session see drafts too.
export async function getAll({ categoryId = null, search = '' } = {}) {
  let query = supabase
    .from(TABLE)
    .select(SELECT)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (categoryId && categoryId !== 'all') {
    query = query.eq('category_id', categoryId)
  }
  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPicks() {
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT)
    .eq('is_published', true)
    .eq('is_pick', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

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
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .limit(limit)
  if (error) throw error
  return data
}
