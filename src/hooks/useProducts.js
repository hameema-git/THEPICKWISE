import { useState, useMemo } from 'react'
import { products as defaultProducts } from '../data/products'

const STORAGE_KEY   = 'pickwise_extra_products'
const OVERRIDES_KEY = 'pickwise_overrides'

function getExtra() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
  catch { return [] }
}

function getOverrides() {
  try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY)) || {} }
  catch { return {} }
}

// Merge default products + overrides + extra products added via admin
function buildAllProducts() {
  const overrides = getOverrides()
  const base = defaultProducts.map(p =>
    overrides[p.id] ? { ...p, ...overrides[p.id] } : p
  )
  return [...base, ...getExtra()]
}

export function useProducts() {
  const [category, setCategory] = useState('all')
  const [search, setSearch]     = useState('')

  // Re-read from localStorage every render so edits appear immediately
  const allProducts = useMemo(() => buildAllProducts(), [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allProducts.filter(p => {
      const catMatch    = category === 'all' || p.category === category
      const searchMatch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.includes(q) ||
        p.review.toLowerCase().includes(q)
      return catMatch && searchMatch
    })
  }, [category, search, allProducts])

  const picks = useMemo(() => allProducts.filter(p => p.is_pick), [allProducts])

  return { filtered, picks, category, setCategory, search, setSearch }
}
