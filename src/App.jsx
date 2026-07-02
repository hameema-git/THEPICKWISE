import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar        from './components/Navbar'
import Footer        from './components/Footer'
import Home          from './pages/Home'
import Picks         from './pages/Picks'
import ProductDetail from './pages/ProductDetail'
import Disclosure    from './pages/Disclosure'
import Privacy       from './pages/Privacy'
import SecretAdmin   from './pages/SecretAdmin'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0,0), [pathname])
  return null
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
  return (
    <>
      <ScrollTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/"                         element={<Home />} />
          <Route path="/picks"                    element={<Picks />} />
          <Route path="/product/:id"              element={<ProductDetail />} />
          <Route path="/disclosure"               element={<Disclosure />} />
          <Route path="/privacy"                  element={<Privacy />} />
          {/* SECRET ADMIN — not linked anywhere, URL only */}
          <Route path="/manage-pickwise-2025"     element={<SecretAdmin />} />
          <Route path="*"                         element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
