import { createClient } from '@supabase/supabase-js'

// Serverless functions run in plain Node, not Vite — so this reads
// process.env directly rather than import.meta.env (which src/lib/supabase.js
// uses). Same underlying env vars already configured in Vercel; no new
// setup needed, just a different runtime reading them.
let client = null
function getClient() {
  if (client) return client
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in the serverless function environment.')
  }
  client = createClient(url, key)
  return client
}

const SELECT = '*, categories(id, name, slug, emoji, color), replacement:replacement_product_id(id, name, image_url, price)'

// Mirrors src/services/publicProductsService.js's getById exactly — same
// visibility rule (published only, discontinued products still load so
// their page doesn't 404), so bots and real visitors see consistent data.
export async function fetchProduct(id) {
  const { data, error } = await getClient()
    .from('products')
    .select(SELECT)
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle()

  if (error) throw error
  return data
}
