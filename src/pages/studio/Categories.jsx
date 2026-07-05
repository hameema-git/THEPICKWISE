import { useState } from 'react'
import StudioLayout from '../../components/studio/StudioLayout'
import { useCategories } from '../../hooks/useCategories'
import * as categoriesService from '../../services/categoriesService'
import styles from './Categories.module.css'

const EMOJI_OPTIONS = ['🍳', '💻', '🏠', '✨', '🧸', '🏋️', '📚', '🐾', '🚗', '🎮', '👗', '☕']

export default function Categories() {
  const { categories, loading, refresh } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null) // category being edited, or null
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0])
  const [color, setColor] = useState('#e63946')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const openNew = () => {
    setEditing(null)
    setName('')
    setEmoji(EMOJI_OPTIONS[0])
    setColor('#e63946')
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setName(cat.name)
    setEmoji(cat.emoji || EMOJI_OPTIONS[0])
    setColor(cat.color || '#e63946')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    if (editing) {
      await categoriesService.update(editing.id, { name: name.trim(), emoji, color })
    } else {
      await categoriesService.create({ name: name.trim(), emoji, color })
    }
    setShowForm(false)
    refresh()
  }

  const handleDelete = async (id) => {
    await categoriesService.remove(id)
    setConfirmDelete(null)
    refresh()
  }

  const move = async (index, direction) => {
    const newOrder = [...categories]
    const swapWith = index + direction
    if (swapWith < 0 || swapWith >= newOrder.length) return
    ;[newOrder[index], newOrder[swapWith]] = [newOrder[swapWith], newOrder[index]]
    await categoriesService.reorder(newOrder.map((c) => c.id))
    refresh()
  }

  return (
    <StudioLayout title="Categories">
      <button className={styles.addBtn} onClick={openNew}>+ Add Category</button>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className={styles.list}>
          {categories.map((cat, i) => (
            <div key={cat.id} className={styles.row}>
              <div className={styles.arrows}>
                <button onClick={() => move(i, -1)} disabled={i === 0}>▲</button>
                <button onClick={() => move(i, 1)} disabled={i === categories.length - 1}>▼</button>
              </div>
              <span className={styles.emoji}>{cat.emoji}</span>
              <span className={styles.colorDot} style={{ background: cat.color || '#94a3b8' }} />
              <span className={styles.name}>{cat.name}</span>
              <div className={styles.rowActions}>
                <button onClick={() => openEdit(cat)}>✏️</button>
                <button onClick={() => setConfirmDelete(cat)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? 'Edit Category' : 'New Category'}</h3>
            <label className={styles.field}>
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kitchen" autoFocus />
            </label>
            <label className={styles.field}>
              <span>Icon</span>
              <div className={styles.emojiPicker}>
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    className={`${styles.emojiOption} ${emoji === e ? styles.emojiSelected : ''}`}
                    onClick={() => setEmoji(e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </label>
            <label className={styles.field}>
              <span>Color</span>
              <div className={styles.colorRow}>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
            </label>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <p>Delete <strong>{confirmDelete.name}</strong>? Products in this category become uncategorized, not deleted.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={() => handleDelete(confirmDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </StudioLayout>
  )
}
