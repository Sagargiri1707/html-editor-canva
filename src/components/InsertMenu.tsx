import { useRef, useEffect } from 'react'
import './InsertMenu.css'

interface InsertMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  onInsertBlockquote: () => void
  onInsertCodeBlock: () => void
  onInsertHorizontalRule: () => void
  onClose: () => void
}

export function InsertMenu({
  isOpen,
  position,
  onInsertBlockquote,
  onInsertCodeBlock,
  onInsertHorizontalRule,
  onClose,
}: InsertMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleInsert = (action: () => void) => {
    action()
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className="insert-menu"
      style={{
        left: position.x,
        top: position.y,
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="insert-menu-header">Insert Block</div>
      
      <button
        type="button"
        className="insert-menu-item"
        onClick={() => handleInsert(onInsertBlockquote)}
      >
        <span className="insert-icon">❝</span>
        <div className="insert-info">
          <span className="insert-label">Blockquote</span>
          <span className="insert-desc">Add a quote block</span>
        </div>
      </button>

      <button
        type="button"
        className="insert-menu-item"
        onClick={() => handleInsert(onInsertCodeBlock)}
      >
        <span className="insert-icon">{"</>"}</span>
        <div className="insert-info">
          <span className="insert-label">Code Block</span>
          <span className="insert-desc">Add code snippet</span>
        </div>
      </button>

      <button
        type="button"
        className="insert-menu-item"
        onClick={() => handleInsert(onInsertHorizontalRule)}
      >
        <span className="insert-icon">―</span>
        <div className="insert-info">
          <span className="insert-label">Divider</span>
          <span className="insert-desc">Horizontal line</span>
        </div>
      </button>
    </div>
  )
}

