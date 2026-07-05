// Generates public/sitemap.xml before every build, so it's never out of date
// with what's actually published in Supabase. Runs via the "prebuild" npm script.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Vite only exposes VITE_ vars to browser code via import.meta.env, not to
// plain Node scripts — so we read .env ourselves here rather than adding a
// dotenv dependency just for this one script.
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim()
  }
}

async function generateSitemap() {
  loadEnv()

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
  const siteUrl = 'https://thepickwise.in'

  const staticRoutes = ['/', '/picks', '/disclosure', '/privacy']
  let productRoutes = []

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data, error } = await supabase
        .from('products')
        .select('id, updated_at')
        .eq('is_published', true)
      if (error) throw error
      productRoutes = (data || []).map((p) => ({ loc: `/product/${p.id}`, lastmod: p.updated_at }))
    } catch (err) {
      console.warn('[sitemap] Could not fetch products from Supabase, generating static routes only:', err.message)
    }
  } else {
    console.warn('[sitemap] Missing Supabase env vars — generating static routes only.')
  }

  const urls = [
    ...staticRoutes.map((loc) => ({ loc, lastmod: null })),
    ...productRoutes,
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${siteUrl}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod.split('T')[0]}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>
`

  const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml')
  fs.writeFileSync(outPath, xml)
  console.log(`[sitemap] Wrote ${urls.length} URLs to public/sitemap.xml`)
}

generateSitemap()
