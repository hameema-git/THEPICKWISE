import { supabase } from '../lib/supabase'

const TABLE = 'categories'

export async function getAll() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function create({ name, emoji = '', color = '', is_featured = false }) {
  // New categories go to the end of the display order.
  const { data: existing } = await supabase
    .from(TABLE)
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)

  const nextOrder = existing?.[0] ? existing[0].display_order + 1 : 1

  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ name, slug: slugify(name), emoji, color, is_featured, display_order: nextOrder }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function update(id, changes) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(changes)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function remove(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

// Accepts an array of category ids in the new desired order.
export async function reorder(orderedIds) {
  const updates = orderedIds.map((id, index) =>
    supabase.from(TABLE).update({ display_order: index + 1 }).eq('id', id)
  )
  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed) throw failed.error
}
