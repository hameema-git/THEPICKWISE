import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import Navbar        from './components/Navbar'
import Footer        from './components/Footer'
import Home          from './pages/Home'
import Picks         from './pages/Picks'
import ProductDetail from './pages/ProductDetail'
import Disclosure    from './pages/Disclosure'
import Privacy       from './pages/Privacy'
import ProtectedRoute from './components/studio/ProtectedRoute'

// Studio is only ever needed by the creator, never by visitors — lazy-loading
// it keeps its code (forms, Studio nav, etc.) out of the public site's bundle.
const StudioLogin = lazy(() => import('./pages/studio/Login'))
const Dashboard    = lazy(() => import('./pages/studio/Dashboard'))
const Products     = lazy(() => import('./pages/studio/Products'))
const ProductForm  = lazy(() => import('./pages/studio/ProductForm'))
const Categories   = lazy(() => import('./pages/studio/Categories'))
const Settings     = lazy(() => import('./pages/studio/Settings'))
const Articles     = lazy(() => import('./pages/studio/Articles'))
const Article      = lazy(() => import('./pages/Article'))

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function StudioFallback() {
  return <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>Loading…</div>
}

function NotFound() {
  return (
    <div style={{textAlign:'center',padding:'5rem 1.5rem'}}>
      <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🔍</div>
      <h1 style={{fontFamily:'var(--font-display)',fontSize:'1.8rem',marginBottom:'0.5rem'}}>Page not found</h1>
      <p style={{color:'var(--muted)',marginBottom:'1.5rem'}}>This page does not exist.</p>
      <a href="/" style={{background:'var(--red)',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'10px',fontWeight:700,display:'inline-block'}}>← Back to Home</a>
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  const isStudio = pathname.startsWith('/studio')

  return (
    <>
      <ScrollTop />
      {!isStudio && <Navbar />}
      <main>
        <Routes>
          <Route path="/"                         element={<Home />} />
          <Route path="/picks"                    element={<Picks />} />
          <Route path="/product/:id"              element={<ProductDetail />} />
          <Route path="/articles/:slug"           element={<Suspense fallback={<StudioFallback />}><Article /></Suspense>} />
          <Route path="/disclosure"               element={<Disclosure />} />
          <Route path="/privacy"                  element={<Privacy />} />

          {/* Creator Studio — real auth, no more secret URLs, lazy-loaded */}
          <Route path="/studio/login" element={
            <Suspense fallback={<StudioFallback />}><StudioLogin /></Suspense>
          } />
          <Route path="/studio" element={
            <ProtectedRoute><Suspense fallback={<StudioFallback />}><Dashboard /></Suspense></ProtectedRoute>
          } />
          <Route path="/studio/products" element={
            <ProtectedRoute><Suspense fallback={<StudioFallback />}><Products /></Suspense></ProtectedRoute>
          } />
          <Route path="/studio/products/new" element={
            <ProtectedRoute><Suspense fallback={<StudioFallback />}><ProductForm /></Suspense></ProtectedRoute>
          } />
          <Route path="/studio/products/:id/edit" element={
            <ProtectedRoute><Suspense fallback={<StudioFallback />}><ProductForm /></Suspense></ProtectedRoute>
          } />
          <Route path="/studio/categories" element={
            <ProtectedRoute><Suspense fallback={<StudioFallback />}><Categories /></Suspense></ProtectedRoute>
          } />
          <Route path="/studio/settings" element={
            <ProtectedRoute><Suspense fallback={<StudioFallback />}><Settings /></Suspense></ProtectedRoute>
          } />
          <Route path="/studio/articles" element={<ProtectedRoute><Suspense fallback={<StudioFallback />}><Articles /></Suspense></ProtectedRoute>} />

          <Route path="*"                         element={<NotFound />} />
        </Routes>
      </main>
      {!isStudio && <Footer />}
    </>
  )
}
