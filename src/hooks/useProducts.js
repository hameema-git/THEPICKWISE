import { useState, useEffect, useCallback } from 'react'
import * as publicProductsService from '../services/publicProductsService'

export function useProducts() {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState([])
  const [picks, setPicks] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [products, picksData] = await Promise.all([
        publicProductsService.getAll({ categoryId: category, search }),
        publicProductsService.getPicks(),
      ])
      setFiltered(products)
      setPicks(picksData)
    } finally {
      setLoading(false)
    }
  }, [category, search])

  useEffect(() => { load() }, [load])

  return { filtered, picks, category, setCategory, search, setSearch, loading }
}
