import { useState, useEffect } from 'react'
import StudioLayout from '../../components/studio/StudioLayout'
import * as settingsService from '../../services/settingsService'
import styles from './Settings.module.css'

const SECTIONS = [
  {
    key: 'branding',
    title: 'Branding',
    fields: [
      { key: 'brand_name', label: 'Brand Name', type: 'text' },
      { key: 'logo_url', label: 'Logo URL', type: 'text' },
      { key: 'theme_color', label: 'Theme Color', type: 'color' },
    ],
  },
  {
    key: 'homepage',
    title: 'Homepage Content',
    fields: [
      { key: 'hero_title', label: 'Hero Title', type: 'text' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
      { key: 'about_text', label: 'About', type: 'textarea' },
    ],
  },
  {
    key: 'social',
    title: 'Social Links',
    fields: [
      { key: 'instagram_url', label: 'Instagram URL', type: 'text' },
      { key: 'youtube_url', label: 'YouTube URL', type: 'text' },
      { key: 'whatsapp_number', label: 'WhatsApp Number', type: 'text' },
    ],
  },
  {
    key: 'seo',
    title: 'SEO Defaults',
    fields: [
      { key: 'seo_title', label: 'Default Page Title', type: 'text' },
      { key: 'seo_description', label: 'Default Meta Description', type: 'textarea' },
    ],
  },
  {
    key: 'legal',
    title: 'Legal',
    fields: [
      { key: 'privacy_policy', label: 'Privacy Policy', type: 'textarea' },
      { key: 'affiliate_disclosure', label: 'Affiliate Disclosure', type: 'textarea' },
    ],
  },
]

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openSection, setOpenSection] = useState('branding')
  const [savingSection, setSavingSection] = useState(null)
  const [savedFlash, setSavedFlash] = useState(null)

  useEffect(() => {
    settingsService.get().then((data) => {
      setSettings(data)
      setLoading(false)
    })
  }, [])

  const handleFieldChange = (key, value) => {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  const handleSaveSection = async (section) => {
    setSavingSection(section.key)
    const changes = Object.fromEntries(section.fields.map((f) => [f.key, settings[f.key]]))
    await settingsService.update(changes)
    setSavingSection(null)
    setSavedFlash(section.key)
    setTimeout(() => setSavedFlash(null), 2000)
  }

  if (loading) return <StudioLayout title="Settings"><p>Loading…</p></StudioLayout>

  return (
    <StudioLayout title="Settings">
      <div className={styles.accordion}>
        {SECTIONS.map((section) => (
          <div key={section.key} className={styles.sectionCard}>
            <button
              className={styles.sectionHeader}
              onClick={() => setOpenSection(openSection === section.key ? null : section.key)}
            >
              <span>{section.title}</span>
              <span className={styles.chevron}>{openSection === section.key ? '▲' : '▼'}</span>
            </button>

            {openSection === section.key && (
              <div className={styles.sectionBody}>
                {section.fields.map((f) => (
                  <label key={f.key} className={styles.field}>
                    <span>{f.label}</span>
                    {f.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={settings[f.key] || ''}
                        onChange={(e) => handleFieldChange(f.key, e.target.value)}
                      />
                    ) : f.type === 'color' ? (
                      <div className={styles.colorRow}>
                        <input
                          type="color"
                          value={settings[f.key] || '#e63946'}
                          onChange={(e) => handleFieldChange(f.key, e.target.value)}
                        />
                        <input
                          type="text"
                          value={settings[f.key] || ''}
                          onChange={(e) => handleFieldChange(f.key, e.target.value)}
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={settings[f.key] || ''}
                        onChange={(e) => handleFieldChange(f.key, e.target.value)}
                      />
                    )}
                  </label>
                ))}
                <button
                  className={styles.saveBtn}
                  onClick={() => handleSaveSection(section)}
                  disabled={savingSection === section.key}
                >
                  {savingSection === section.key ? 'Saving…' : savedFlash === section.key ? '✓ Saved' : `Save ${section.title}`}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </StudioLayout>
  )
}
