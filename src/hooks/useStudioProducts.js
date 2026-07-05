import { useState, useEffect, useCallback } from 'react'
import * as productsService from '../services/productsService'

export function useStudioProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [categoryId, setCategoryIdState] = useState('all')
  const [search, setSearchState] = useState('')
  const [published, setPublishedState] = useState('all')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const load = useCallback(async (targetPage, append) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    try {
      const { data, count, hasMore: more } = await productsService.getAll({
        categoryId, search, published, page: targetPage,
      })
      setProducts((prev) => (append ? [...prev, ...data] : data))
      setHasMore(more)
      setTotal(count)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [categoryId, search, published])

  // Any filter changed — reset to page 0 and replace the list.
  useEffect(() => {
    setPage(0)
    load(0, false)
  }, [categoryId, search, published]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    load(nextPage, true)
  }

  const setCategoryId = (id) => setCategoryIdState(id)
  const setSearch = (value) => setSearchState(value)
  const setPublished = (value) => setPublishedState(value)

  const refresh = useCallback(() => {
    setPage(0)
    load(0, false)
  }, [load])

  return {
    products, loading, loadingMore, error, refresh,
    categoryId, setCategoryId, search, setSearch,
    published, setPublished,
    hasMore, loadMore, total,
  }
}
