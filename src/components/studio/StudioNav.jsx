import { NavLink } from 'react-router-dom'
import styles from './StudioNav.module.css'
const NAV_ITEMS = [
  { to: '/studio', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/studio/products', label: 'Products', icon: '📦' },
  { to: '/studio/products/new', label: 'Add', icon: '➕', primary: true },
  { to: '/studio/categories', label: 'Categories', icon: '🏷️' },
  { to: '/studio/articles', label: 'Articles', icon: '📝' },
  { to: '/studio/settings', label: 'Settings', icon: '⚙️' },
]
export default function StudioNav(){return <nav className={styles.nav}>{NAV_ITEMS.map(item=><NavLink key={item.to} to={item.to} end={item.end} className={({isActive})=>`${styles.item} ${item.primary?styles.primary:''} ${isActive?styles.active:''}`}><span className={styles.icon}>{item.icon}</span><span className={styles.label}>{item.label}</span></NavLink>)}</nav>}
