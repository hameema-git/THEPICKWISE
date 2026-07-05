import { supabase } from '../lib/supabase'

const TABLE = 'settings'

export async function get() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .limit(1)
    .single()
  if (error) throw error
  return data
}

export async function update(changes) {
  // There's always exactly one settings row (seeded in the migration).
  const current = await get()
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq('id', current.id)
    .select()
    .single()
  if (error) throw error
  return data
}
