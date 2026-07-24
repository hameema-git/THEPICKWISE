import { useState, useEffect, useCallback } from 'react'
import * as publicProductsService from '../services/publicProductsService'

export function useProducts() {
  const [category, setCategoryState] = useState('all')
  const [search, setSearchState] = useState('')
  const [filtered, setFiltered] = useState([])
  const [picks, setPicks] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const load = useCallback(async (targetPage, append) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    try {
      const productsResult = await publicProductsService.getAll({ categoryId: category, search, page: targetPage })
      setFiltered((prev) => (append ? [...prev, ...productsResult.data] : productsResult.data))
      setHasMore(productsResult.hasMore)
      setTotal(productsResult.count)

      // Picks/Trending only need to load once per filter change, alongside page 0.
      if (!append) {
        const [picksData, trendingData] = await Promise.all([
          publicProductsService.getPicks(),
          publicProductsService.getTrending(8),
        ])
        setPicks(picksData)
        setTrending(trendingData)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [category, search])

  // Filters changed — reset to page 0 and replace the list.
  useEffect(() => {
    setPage(0)
    load(0, false)
  }, [category, search]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    load(nextPage, true)
  }

  const setCategory = (c) => setCategoryState(c)
  const setSearch = (s) => setSearchState(s)

  return {
    filtered, picks, trending, category, setCategory, search, setSearch,
    loading, loadingMore, hasMore, loadMore, total,
  }
}
