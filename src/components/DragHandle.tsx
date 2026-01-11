import { useEffect, useState, useCallback, RefObject, useRef } from 'react'
import './DragHandle.css'

interface DragHandleProps {
  editorRef: RefObject<HTMLDivElement | null>
  onDragStart: (element: HTMLElement, e: MouseEvent) => void
  findBlockParent: (element: HTMLElement) => HTMLElement | null
}

interface HandlePosition {
  x: number
  y: number
  visible: boolean
  targetElement: HTMLElement | null
}

export function DragHandle({ editorRef, onDragStart, findBlockParent }: DragHandleProps) {
  const [position, setPosition] = useState<HandlePosition>({
    x: 0,
    y: 0,
    visible: false,
    targetElement: null,
  })
  const handleRef = useRef<HTMLDivElement>(null)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isHoveringHandle = useRef(false)

  const showHandle = useCallback((block: HTMLElement) => {
    if (!editorRef.current) return
    
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }

    const rect = block.getBoundingClientRect()
    const editorRect = editorRef.current.getBoundingClientRect()
    
    setPosition({
      x: editorRect.left - 36,
      y: rect.top + (rect.height / 2) - 12,
      visible: true,
      targetElement: block,
    })
  }, [editorRef])

  const hideHandle = useCallback((delay = 150) => {
    // Don't hide if hovering over the handle itself
    if (isHoveringHandle.current) return
    
    // Clear any existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    
    // Add a small delay before hiding
    hideTimeoutRef.current = setTimeout(() => {
      if (!isHoveringHandle.current) {
        setPosition(prev => ({ ...prev, visible: false, targetElement: null }))
      }
    }, delay)
  }, [])

  const updatePosition = useCallback((e: MouseEvent) => {
    if (!editorRef.current) return

    const target = e.target as HTMLElement
    
    // Don't update if we're over the handle itself
    if (target.closest('.drag-handle')) return

    // Find the block parent
    const block = findBlockParent(target)
    
    if (block) {
      showHandle(block)
    } else {
      hideHandle()
    }
  }, [editorRef, findBlockParent, showHandle, hideHandle])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e)
    }

    const handleMouseLeave = () => {
      hideHandle(300)
    }

    editor.addEventListener('mousemove', handleMouseMove)
    editor.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      editor.removeEventListener('mousemove', handleMouseMove)
      editor.removeEventListener('mouseleave', handleMouseLeave)
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [editorRef, updatePosition, hideHandle])

  // Handle mouse enter/leave on the drag handle itself
  const handleMouseEnter = useCallback(() => {
    isHoveringHandle.current = true
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    isHoveringHandle.current = false
    hideHandle(300)
  }, [hideHandle])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (position.targetElement) {
      onDragStart(position.targetElement, e.nativeEvent)
    }
  }, [position.targetElement, onDragStart])

  if (!position.visible) {
    return null
  }

  return (
    <div
      ref={handleRef}
      className="drag-handle"
      style={{
        left: position.x,
        top: position.y,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      title="Drag to reorder"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="5" cy="4" r="1.5" />
        <circle cx="11" cy="4" r="1.5" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="11" cy="8" r="1.5" />
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="11" cy="12" r="1.5" />
      </svg>
    </div>
  )
}
