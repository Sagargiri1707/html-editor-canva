import { useEffect, useState, useCallback, RefObject } from 'react'
import { LinkPopover } from './LinkPopover'
import { ColorPicker } from './ColorPicker'
import { FontPicker } from './FontPicker'
import { InsertMenu } from './InsertMenu'
import './FloatingToolbar.css'

type BlockType = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

type Alignment = 'left' | 'center' | 'right' | 'justify'

interface FloatingToolbarProps {
  editorRef: RefObject<HTMLDivElement | null>
  formatState: {
    bold: boolean
    italic: boolean
    underline: boolean
    blockType: BlockType
    bulletList: boolean
    numberedList: boolean
    currentLink: string | null
    textColor: string
    backgroundColor: string
    fontFamily: string
    fontSize: string
    alignment: Alignment
  }
  onBold: () => void
  onItalic: () => void
  onUnderline: () => void
  onStrikethrough: () => void
  onBlockType: (type: BlockType) => void
  onBulletList: () => void
  onNumberedList: () => void
  onInsertLink: (url: string) => void
  onRemoveLink: () => void
  onTextColor: (color: string) => void
  onBackgroundColor: (color: string) => void
  onFontFamily: (font: string) => void
  onFontSize: (size: string) => void
  onAlignment: (alignment: Alignment) => void
  onInsertBlockquote: () => void
  onInsertCodeBlock: () => void
  onInsertHorizontalRule: () => void
}

interface Position {
  x: number
  y: number
  visible: boolean
}

const BLOCK_TYPES: { value: BlockType; label: string }[] = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
]

export function FloatingToolbar({
  editorRef,
  formatState,
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onBlockType,
  onBulletList,
  onNumberedList,
  onInsertLink,
  onRemoveLink,
  onTextColor,
  onBackgroundColor,
  onFontFamily,
  onFontSize,
  onAlignment,
  onInsertBlockquote,
  onInsertCodeBlock,
  onInsertHorizontalRule,
}: FloatingToolbarProps) {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0, visible: false })
  const [showBlockMenu, setShowBlockMenu] = useState(false)
  const [showLinkPopover, setShowLinkPopover] = useState(false)
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  const [showFontPicker, setShowFontPicker] = useState(false)
  const [showInsertMenu, setShowInsertMenu] = useState(false)
  const [linkPosition, setLinkPosition] = useState({ x: 0, y: 0 })
  const [colorPosition, setColorPosition] = useState({ x: 0, y: 0 })
  const [fontPosition, setFontPosition] = useState({ x: 0, y: 0 })
  const [insertPosition, setInsertPosition] = useState({ x: 0, y: 0 })

  const updatePosition = useCallback(() => {
    const selection = window.getSelection()
    
    if (
      !selection || 
      selection.isCollapsed || 
      !selection.rangeCount ||
      !editorRef.current
    ) {
      setPosition(prev => ({ ...prev, visible: false }))
      setShowBlockMenu(false)
      return
    }

    const range = selection.getRangeAt(0)
    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      setPosition(prev => ({ ...prev, visible: false }))
      setShowBlockMenu(false)
      return
    }

    const rect = range.getBoundingClientRect()
    const editorRect = editorRef.current.getBoundingClientRect()
    
    const toolbarWidth = 450
    const toolbarHeight = 44
    const gap = 8
    
    let x = rect.left + (rect.width / 2) - (toolbarWidth / 2)
    let y = rect.top - toolbarHeight - gap

    const padding = 8
    x = Math.max(padding, Math.min(x, window.innerWidth - toolbarWidth - padding))
    
    if (y < padding) {
      y = rect.bottom + gap
    }

    if (
      rect.top >= editorRect.top - 50 &&
      rect.bottom <= editorRect.bottom + 50
    ) {
      setPosition({ x, y, visible: true })
    } else {
      setPosition(prev => ({ ...prev, visible: false }))
    }
  }, [editorRef])

  useEffect(() => {
    const handleSelectionChange = () => {
      if (!showLinkPopover && !showTextColorPicker && !showBgColorPicker && !showFontPicker) {
        requestAnimationFrame(updatePosition)
      }
    }

    const handleMouseUp = () => {
      if (!showLinkPopover && !showTextColorPicker && !showBgColorPicker && !showFontPicker) {
        setTimeout(updatePosition, 10)
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [updatePosition, showLinkPopover, showTextColorPicker, showBgColorPicker])

  useEffect(() => {
    const handleScroll = () => {
      updatePosition()
    }
    
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [updatePosition])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest('.block-menu-wrapper')) {
        setShowBlockMenu(false)
      }
      if (!target.closest('.link-popover') && !target.closest('.link-btn-toolbar')) {
        setShowLinkPopover(false)
      }
    }

    if (showBlockMenu || showLinkPopover) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showBlockMenu, showLinkPopover])

  const handleLinkClick = (e: React.MouseEvent) => {
    const rect = (e.target as Element).getBoundingClientRect()
    setLinkPosition({
      x: rect.left,
      y: rect.bottom + 8,
    })
    setShowLinkPopover(true)
  }

  const handleTextColorClick = (e: React.MouseEvent) => {
    const rect = (e.target as Element).getBoundingClientRect()
    setColorPosition({
      x: Math.max(8, rect.left - 100),
      y: rect.bottom + 8,
    })
    setShowTextColorPicker(true)
    setShowBgColorPicker(false)
  }

  const handleBgColorClick = (e: React.MouseEvent) => {
    const rect = (e.target as Element).getBoundingClientRect()
    setColorPosition({
      x: Math.max(8, rect.left - 100),
      y: rect.bottom + 8,
    })
    setShowBgColorPicker(true)
    setShowTextColorPicker(false)
  }

  const handleFontClick = (e: React.MouseEvent) => {
    const rect = (e.target as Element).getBoundingClientRect()
    setFontPosition({
      x: Math.max(8, rect.left - 50),
      y: rect.bottom + 8,
    })
    setShowFontPicker(true)
  }

  const handleInsertClick = (e: React.MouseEvent) => {
    const rect = (e.target as Element).getBoundingClientRect()
    setInsertPosition({
      x: Math.max(8, rect.left - 50),
      y: rect.bottom + 8,
    })
    setShowInsertMenu(true)
  }

  const handleLinkSubmit = (url: string) => {
    onInsertLink(url)
    setShowLinkPopover(false)
  }

  const handleLinkRemove = () => {
    onRemoveLink()
    setShowLinkPopover(false)
  }

  if (!position.visible) {
    return null
  }

  const currentBlockLabel = BLOCK_TYPES.find(b => b.value === formatState.blockType)?.label || 'Paragraph'
  const hasLink = !!formatState.currentLink

  return (
    <>
      <div 
        className="floating-toolbar"
        style={{
          left: position.x,
          top: position.y,
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        {/* Block type dropdown */}
        <div className="block-menu-wrapper">
          <button
            type="button"
            className="floating-btn block-btn"
            onClick={() => setShowBlockMenu(!showBlockMenu)}
            title="Text style"
          >
            {currentBlockLabel}
            <span className="dropdown-arrow">▾</span>
          </button>
          
          {showBlockMenu && (
            <div className="block-menu">
              {BLOCK_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`block-menu-item ${formatState.blockType === value ? 'active' : ''}`}
                  onClick={() => {
                    onBlockType(value)
                    setShowBlockMenu(false)
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font button */}
        <button
          type="button"
          className={`floating-btn font-btn ${showFontPicker ? 'active' : ''}`}
          onClick={handleFontClick}
          title="Font & Size"
        >
          Aa
        </button>

        <div className="toolbar-divider" />

        {/* Text formatting */}
        <button
          type="button"
          className={`floating-btn ${formatState.bold ? 'active' : ''}`}
          onClick={onBold}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={`floating-btn ${formatState.italic ? 'active' : ''}`}
          onClick={onItalic}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={`floating-btn ${formatState.underline ? 'active' : ''}`}
          onClick={onUnderline}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          className="floating-btn"
          onClick={onStrikethrough}
          title="Strikethrough"
        >
          <s>S</s>
        </button>

        <div className="toolbar-divider" />

        {/* Color buttons */}
        <button
          type="button"
          className={`floating-btn color-btn ${showTextColorPicker ? 'active' : ''}`}
          onClick={handleTextColorClick}
          title="Text color"
        >
          <span className="color-icon">A</span>
          <span 
            className="color-bar" 
            style={{ backgroundColor: formatState.textColor || '#000000' }}
          />
        </button>
        <button
          type="button"
          className={`floating-btn color-btn ${showBgColorPicker ? 'active' : ''}`}
          onClick={handleBgColorClick}
          title="Background color"
        >
          <span className="color-icon bg-icon">A</span>
          <span 
            className="color-bar" 
            style={{ backgroundColor: formatState.backgroundColor || 'transparent' }}
          />
        </button>

        <div className="toolbar-divider" />

        {/* Link */}
        <button
          type="button"
          className={`floating-btn link-btn-toolbar ${hasLink ? 'active' : ''}`}
          onClick={handleLinkClick}
          title={hasLink ? 'Edit link (Ctrl+K)' : 'Add link (Ctrl+K)'}
        >
          🔗
        </button>

        <div className="toolbar-divider" />

        {/* Lists */}
        <button
          type="button"
          className={`floating-btn ${formatState.bulletList ? 'active' : ''}`}
          onClick={onBulletList}
          title="Bullet list"
        >
          •≡
        </button>
        <button
          type="button"
          className={`floating-btn ${formatState.numberedList ? 'active' : ''}`}
          onClick={onNumberedList}
          title="Numbered list"
        >
          1.
        </button>

        <div className="toolbar-divider" />

        {/* Alignment */}
        <button
          type="button"
          className={`floating-btn align-btn ${formatState.alignment === 'left' ? 'active' : ''}`}
          onClick={() => onAlignment('left')}
          title="Align left"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="2" width="14" height="2" rx="0.5"/>
            <rect x="1" y="7" width="10" height="2" rx="0.5"/>
            <rect x="1" y="12" width="12" height="2" rx="0.5"/>
          </svg>
        </button>
        <button
          type="button"
          className={`floating-btn align-btn ${formatState.alignment === 'center' ? 'active' : ''}`}
          onClick={() => onAlignment('center')}
          title="Align center"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="2" width="14" height="2" rx="0.5"/>
            <rect x="3" y="7" width="10" height="2" rx="0.5"/>
            <rect x="2" y="12" width="12" height="2" rx="0.5"/>
          </svg>
        </button>
        <button
          type="button"
          className={`floating-btn align-btn ${formatState.alignment === 'right' ? 'active' : ''}`}
          onClick={() => onAlignment('right')}
          title="Align right"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="2" width="14" height="2" rx="0.5"/>
            <rect x="5" y="7" width="10" height="2" rx="0.5"/>
            <rect x="3" y="12" width="12" height="2" rx="0.5"/>
          </svg>
        </button>

        <div className="toolbar-divider" />

        {/* Insert menu */}
        <button
          type="button"
          className={`floating-btn insert-btn ${showInsertMenu ? 'active' : ''}`}
          onClick={handleInsertClick}
          title="Insert block"
        >
          +
        </button>
      </div>

      {/* Link Popover */}
      <LinkPopover
        isOpen={showLinkPopover}
        position={linkPosition}
        initialUrl={formatState.currentLink || ''}
        onSubmit={handleLinkSubmit}
        onRemove={handleLinkRemove}
        onClose={() => setShowLinkPopover(false)}
      />

      {/* Text Color Picker */}
      <ColorPicker
        isOpen={showTextColorPicker}
        position={colorPosition}
        currentColor={formatState.textColor}
        type="text"
        onSelect={onTextColor}
        onClose={() => setShowTextColorPicker(false)}
      />

      {/* Background Color Picker */}
      <ColorPicker
        isOpen={showBgColorPicker}
        position={colorPosition}
        currentColor={formatState.backgroundColor}
        type="background"
        onSelect={onBackgroundColor}
        onClose={() => setShowBgColorPicker(false)}
      />

      {/* Font Picker */}
      <FontPicker
        isOpen={showFontPicker}
        position={fontPosition}
        currentFont={formatState.fontFamily}
        currentSize={formatState.fontSize}
        onFontChange={onFontFamily}
        onSizeChange={onFontSize}
        onClose={() => setShowFontPicker(false)}
      />

      {/* Insert Menu */}
      <InsertMenu
        isOpen={showInsertMenu}
        position={insertPosition}
        onInsertBlockquote={onInsertBlockquote}
        onInsertCodeBlock={onInsertCodeBlock}
        onInsertHorizontalRule={onInsertHorizontalRule}
        onClose={() => setShowInsertMenu(false)}
      />
    </>
  )
}
