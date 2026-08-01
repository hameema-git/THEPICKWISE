import { useMemo, useState } from 'react'
import { parseProductImport, PRODUCT_IMPORT_PROMPT } from '../../utils/productImport'
import styles from './JsonImportPanel.module.css'

export default function JsonImportPanel({ categories, onImport }) {
  const [rawJson, setRawJson] = useState('')
  const [copied, setCopied] = useState(false)
  const result = useMemo(() => rawJson.trim() ? parseProductImport(rawJson, categories) : null, [rawJson, categories])

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(PRODUCT_IMPORT_PROMPT)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className={styles.panel} aria-label="AI JSON Import">
      <div className={styles.header}>
        <div><h2>AI JSON Import</h2><p>Paste one product from ChatGPT, validate it, then apply the safe preview.</p></div>
        <button type="button" className={styles.promptButton} onClick={copyPrompt}>{copied ? 'Copied!' : 'Copy ChatGPT Prompt'}</button>
      </div>
      <textarea className={styles.textarea} value={rawJson} onChange={(event) => setRawJson(event.target.value)} placeholder={'{\n  "name": "…",\n  "price": 999\n}'} rows={10} spellCheck="false" />
      {result && (
        <div className={styles.result} aria-live="polite">
          {result.errors.length > 0 && <div className={styles.errors}>{result.errors.map((error) => <p key={error}>{error}</p>)}</div>}
          {result.warnings.length > 0 && <div className={styles.warnings}>{result.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>}
          {result.product && result.errors.length === 0 && (
            <>
              <p className={styles.ready}>Ready to import {result.importedFields.length} field{result.importedFields.length === 1 ? '' : 's'}.</p>
              {result.categoryName && <p className={styles.category}>{result.categoryMatch?.exact ? `Category matched: ${result.categoryMatch.category.name}` : result.categoryMatch ? `Category suggestion: ${result.categoryMatch.category.name}` : `New category available: ${result.categoryName}`}</p>}
              <button type="button" className={styles.applyButton} onClick={() => onImport(result)}>Apply to product form</button>
            </>
          )}
        </div>
      )}
    </section>
  )
}
