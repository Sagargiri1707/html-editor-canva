import { useState, useRef, useEffect } from 'react'
import './ColorPicker.css'

interface ColorPickerProps {
  isOpen: boolean
  position: { x: number; y: number }
  currentColor: string
  type: 'text' | 'background'
  onSelect: (color: string) => void
  onClose: () => void
}

// Preset colors organized by shade
const PRESET_COLORS = [
  // Row 1 - Grayscale
  ['#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6', '#ffffff'],
  // Row 2 - Reds
  ['#7f1d1d', '#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fee2e2'],
  // Row 3 - Oranges
  ['#78350f', '#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7'],
  // Row 4 - Greens
  ['#14532d', '#166534', '#16a34a', '#22c55e', '#4ade80', '#86efac', '#dcfce7'],
  // Row 5 - Blues
  ['#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
  // Row 6 - Purples
  ['#4c1d95', '#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ede9fe'],
  // Row 7 - Pinks
  ['#831843', '#be185d', '#db2777', '#ec4899', '#f472b6', '#f9a8d4', '#fce7f3'],
]

export function ColorPicker({
  isOpen,
  position,
  currentColor,
  type,
  onSelect,
  onClose,
}: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(currentColor || '#000000')
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

  const handlePresetClick = (color: string) => {
    onSelect(color)
    onClose()
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value)
  }

  const handleCustomApply = () => {
    onSelect(customColor)
    onClose()
  }

  const handleRemoveColor = () => {
    onSelect('')
    onClose()
  }

  return (
    <div
      ref={pickerRef}
      className="color-picker"
      style={{
        left: position.x,
        top: position.y,
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="color-picker-header">
        <span className="color-picker-title">
          {type === 'text' ? 'Text Color' : 'Background Color'}
        </span>
        <button className="color-picker-close" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Preset colors */}
      <div className="color-presets">
        {PRESET_COLORS.map((row, rowIndex) => (
          <div key={rowIndex} className="color-row">
            {row.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-swatch ${color === currentColor ? 'active' : ''} ${color === '#ffffff' ? 'white' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handlePresetClick(color)}
                title={color}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Custom color */}
      <div className="color-custom">
        <input
          type="color"
          value={customColor}
          onChange={handleCustomChange}
          className="color-input-native"
        />
        <input
          type="text"
          value={customColor}
          onChange={(e) => setCustomColor(e.target.value)}
          className="color-input-text"
          placeholder="#000000"
        />
        <button
          type="button"
          className="color-apply-btn"
          onClick={handleCustomApply}
        >
          Apply
        </button>
      </div>

      {/* Remove color button */}
      <button
        type="button"
        className="color-remove-btn"
        onClick={handleRemoveColor}
      >
        Remove {type === 'text' ? 'text' : 'background'} color
      </button>
    </div>
  )
}

