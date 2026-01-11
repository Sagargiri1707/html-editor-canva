import { useState, useRef, useEffect } from 'react'
import './LinkPopover.css'

interface LinkPopoverProps {
  isOpen: boolean
  position: { x: number; y: number }
  initialUrl?: string
  onSubmit: (url: string) => void
  onRemove: () => void
  onClose: () => void
}

export function LinkPopover({
  isOpen,
  position,
  initialUrl = '',
  onSubmit,
  onRemove,
  onClose,
}: LinkPopoverProps) {
  const [url, setUrl] = useState(initialUrl)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setUrl(initialUrl)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen, initialUrl])

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      // Add https:// if no protocol specified
      let finalUrl = url.trim()
      if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith('mailto:')) {
        finalUrl = 'https://' + finalUrl
      }
      onSubmit(finalUrl)
    }
  }

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="link-popover"
      style={{
        left: position.x,
        top: position.y,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="link-form">
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter URL..."
          className="link-input"
        />
        <div className="link-actions">
          <button type="submit" className="link-btn link-btn-primary" disabled={!url.trim()}>
            {initialUrl ? 'Update' : 'Add'} Link
          </button>
          {initialUrl && (
            <button 
              type="button" 
              className="link-btn link-btn-danger"
              onClick={onRemove}
            >
              Remove
            </button>
          )}
          <button 
            type="button" 
            className="link-btn"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

