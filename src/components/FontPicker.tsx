import { useState, useRef, useEffect } from 'react'
import './FontPicker.css'

interface FontPickerProps {
  isOpen: boolean
  position: { x: number; y: number }
  currentFont: string
  currentSize: string
  onFontChange: (font: string) => void
  onSizeChange: (size: string) => void
  onClose: () => void
}

// Font families available
const FONTS = [
  { value: '', label: 'Default' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans' },
]

// Font sizes
const SIZES = [
  { value: '12px', label: 'Small' },
  { value: '14px', label: 'Normal' },
  { value: '16px', label: 'Medium' },
  { value: '18px', label: 'Large' },
  { value: '24px', label: 'XL' },
  { value: '32px', label: '2XL' },
  { value: '48px', label: '3XL' },
]

export function FontPicker({
  isOpen,
  position,
  currentFont,
  currentSize,
  onFontChange,
  onSizeChange,
  onClose,
}: FontPickerProps) {
  const [activeTab, setActiveTab] = useState<'font' | 'size'>('font')
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={pickerRef}
      className="font-picker"
      style={{
        left: position.x,
        top: position.y,
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="font-picker-header">
        <button
          className={`font-tab ${activeTab === 'font' ? 'active' : ''}`}
          onClick={() => setActiveTab('font')}
        >
          Font
        </button>
        <button
          className={`font-tab ${activeTab === 'size' ? 'active' : ''}`}
          onClick={() => setActiveTab('size')}
        >
          Size
        </button>
        <button className="font-picker-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="font-picker-content">
        {activeTab === 'font' ? (
          <div className="font-list">
            {FONTS.map(({ value, label }) => (
              <button
                key={label}
                type="button"
                className={`font-item ${currentFont === value ? 'active' : ''}`}
                style={{ fontFamily: value || 'inherit' }}
                onClick={() => {
                  onFontChange(value)
                  onClose()
                }}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <div className="size-list">
            {SIZES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`size-item ${currentSize === value ? 'active' : ''}`}
                onClick={() => {
                  onSizeChange(value)
                  onClose()
                }}
              >
                <span className="size-preview" style={{ fontSize: value }}>Aa</span>
                <span className="size-label">{label}</span>
                <span className="size-value">{value}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

