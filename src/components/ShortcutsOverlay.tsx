import { useEffect, useCallback } from 'react'
import './ShortcutsOverlay.css'

interface ShortcutsOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC')
const modKey = isMac ? '⌘' : 'Ctrl'

const SHORTCUTS = [
  {
    category: 'Text Formatting',
    items: [
      { keys: [`${modKey}`, 'B'], description: 'Bold' },
      { keys: [`${modKey}`, 'I'], description: 'Italic' },
      { keys: [`${modKey}`, 'U'], description: 'Underline' },
      { keys: [`${modKey}`, 'K'], description: 'Insert link' },
    ],
  },
  {
    category: 'Headings',
    items: [
      { keys: [`${modKey}`, 'Shift', '1'], description: 'Heading 1' },
      { keys: [`${modKey}`, 'Shift', '2'], description: 'Heading 2' },
      { keys: [`${modKey}`, 'Shift', '3'], description: 'Heading 3' },
      { keys: [`${modKey}`, 'Shift', '0'], description: 'Paragraph' },
    ],
  },
  {
    category: 'History',
    items: [
      { keys: [`${modKey}`, 'Z'], description: 'Undo' },
      { keys: [`${modKey}`, 'Shift', 'Z'], description: 'Redo' },
      ...(isMac ? [] : [{ keys: ['Ctrl', 'Y'], description: 'Redo (Alt)' }]),
    ],
  },
  {
    category: 'Selection',
    items: [
      { keys: ['Esc'], description: 'Deselect / Close menu' },
      { keys: ['Delete'], description: 'Delete selected element' },
    ],
  },
]

export function ShortcutsOverlay({ isOpen, onClose }: ShortcutsOverlayProps) {
  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2 className="shortcuts-title">Keyboard Shortcuts</h2>
          <button className="shortcuts-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="shortcuts-content">
          {SHORTCUTS.map(({ category, items }) => (
            <div key={category} className="shortcuts-section">
              <h3 className="shortcuts-category">{category}</h3>
              <div className="shortcuts-list">
                {items.map(({ keys, description }) => (
                  <div key={description} className="shortcut-item">
                    <span className="shortcut-desc">{description}</span>
                    <span className="shortcut-keys">
                      {keys.map((key, i) => (
                        <span key={i}>
                          <kbd className="shortcut-key">{key}</kbd>
                          {i < keys.length - 1 && <span className="shortcut-plus">+</span>}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          Press <kbd>Esc</kbd> or click outside to close
        </div>
      </div>
    </div>
  )
}

