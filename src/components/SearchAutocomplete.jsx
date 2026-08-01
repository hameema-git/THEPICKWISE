import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as publicProductsService from '../services/publicProductsService'
import styles from './SearchAutocomplete.module.css'

const RECENT_KEY = 'pickwise-recent-searches'
const getRecentSearches = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}

export default function SearchAutocomplete({ value, onChange, placeholderOptions = [] }) {
  const navigate = useNavigate()
  const container = useRef(null)
  const [suggestions, setSuggestions] = useState([])
  const [recent, setRecent] = useState(getRecentSearches)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  useEffect(() => {
    if (placeholderOptions.length < 2) return undefined
    const interval = window.setInterval(() => setPlaceholderIndex((index) => (index + 1) % placeholderOptions.length), 2600)
    return () => window.clearInterval(interval)
  }, [placeholderOptions])

  useEffect(() => {
    const query = value.trim()
    if (!query) { setSuggestions([]); return undefined }
    const timer = window.setTimeout(() => {
      publicProductsService.searchSuggestions(query).then(setSuggestions).catch(() => setSuggestions([]))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [value])

  useEffect(() => {
    const close = (event) => { if (!container.current?.contains(event.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const saveRecent = (term) => {
    const clean = term.trim()
    if (!clean) return
    const next = [clean, ...recent.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 5)
    setRecent(next)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  }
  const selectTerm = (term) => { onChange(term); saveRecent(term); setOpen(false); setActiveIndex(-1) }
  const selectProduct = (product) => { saveRecent(product.name); setOpen(false); navigate(`/product/${product.id}`) }
  const items = value.trim() ? suggestions : recent.map((name) => ({ id: `recent-${name}`, name, recent: true }))

  const handleKeyDown = (event) => {
    if (!open && ['ArrowDown', 'ArrowUp'].includes(event.key)) setOpen(true)
    if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, items.length - 1)); return }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, -1)); return }
    if (event.key === 'Escape') { setOpen(false); return }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (activeIndex >= 0 && items[activeIndex]) {
        const item = items[activeIndex]
        if (item.recent) selectTerm(item.name)
        else selectProduct(item)
      } else selectTerm(value)
    }
  }

  const placeholder = placeholderOptions.length ? `Search ${placeholderOptions[placeholderIndex]}…` : 'Search products…'
  return (
    <div className={styles.wrapper} ref={container}>
      <div className={styles.box}>
        <span aria-hidden="true">🔍</span>
        <input type="search" value={value} placeholder={placeholder} onFocus={() => setOpen(true)} onChange={(event) => { onChange(event.target.value); setOpen(true); setActiveIndex(-1) }} onKeyDown={handleKeyDown} aria-autocomplete="list" aria-expanded={open} />
        {value && <button type="button" onClick={() => { onChange(''); setOpen(true) }} aria-label="Clear search">×</button>}
      </div>
      {open && (items.length > 0 || value.trim()) && (
        <div className={styles.dropdown} role="listbox">
          {!value.trim() && recent.length > 0 && <p className={styles.label}>Recent searches</p>}
          {items.map((item, index) => (
            <button type="button" role="option" aria-selected={activeIndex === index} key={item.id} className={activeIndex === index ? styles.active : ''} onMouseDown={() => item.recent ? selectTerm(item.name) : selectProduct(item)}>
              <span>{item.recent ? '↻' : '🔎'}</span><span>{item.name}</span>{!item.recent && item.categories?.name && <small>{item.categories.name}</small>}
            </button>
          ))}
          {value.trim() && items.length === 0 && <p className={styles.noSuggestion}>No matching products yet. Press Enter to search.</p>}
        </div>
      )}
    </div>
  )
}
