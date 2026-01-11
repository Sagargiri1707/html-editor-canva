import { useEffect, useState, useCallback, useRef } from 'react'
import './ImageResizer.css'

interface ImageResizerProps {
  selectedImage: HTMLImageElement | null
  onResize: (width: number, height: number) => void
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se'

interface ResizeState {
  isResizing: boolean
  handle: ResizeHandle | null
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}

export function ImageResizer({ selectedImage, onResize }: ImageResizerProps) {
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0, visible: false })
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    handle: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  })
  const aspectRatio = useRef(1)

  // Update position when image changes or moves
  const updateRect = useCallback(() => {
    if (!selectedImage) {
      setRect(prev => ({ ...prev, visible: false }))
      return
    }

    const imgRect = selectedImage.getBoundingClientRect()
    setRect({
      x: imgRect.left,
      y: imgRect.top,
      width: imgRect.width,
      height: imgRect.height,
      visible: true,
    })
    aspectRatio.current = imgRect.width / imgRect.height
  }, [selectedImage])

  useEffect(() => {
    updateRect()

    const handleScroll = () => updateRect()
    const handleResize = () => updateRect()

    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [updateRect])

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    e.preventDefault()
    e.stopPropagation()

    if (!selectedImage) return

    const imgRect = selectedImage.getBoundingClientRect()
    
    setResizeState({
      isResizing: true,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: imgRect.width,
      startHeight: imgRect.height,
    })
  }, [selectedImage])

  // Handle resize move
  useEffect(() => {
    if (!resizeState.isResizing || !selectedImage) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeState.startX
      // Note: deltaY is available for future non-aspect-ratio resizing
      // const deltaY = e.clientY - resizeState.startY

      let newWidth = resizeState.startWidth
      let newHeight = resizeState.startHeight

      // Calculate new dimensions based on handle
      switch (resizeState.handle) {
        case 'se':
          newWidth = Math.max(50, resizeState.startWidth + deltaX)
          newHeight = newWidth / aspectRatio.current
          break
        case 'sw':
          newWidth = Math.max(50, resizeState.startWidth - deltaX)
          newHeight = newWidth / aspectRatio.current
          break
        case 'ne':
          newWidth = Math.max(50, resizeState.startWidth + deltaX)
          newHeight = newWidth / aspectRatio.current
          break
        case 'nw':
          newWidth = Math.max(50, resizeState.startWidth - deltaX)
          newHeight = newWidth / aspectRatio.current
          break
      }

      // Apply dimensions directly for preview
      selectedImage.style.width = `${newWidth}px`
      selectedImage.style.height = `${newHeight}px`
      
      // Update visual rect
      setRect(prev => ({
        ...prev,
        width: newWidth,
        height: newHeight,
      }))
    }

    const handleMouseUp = () => {
      // Finalize the resize
      const finalWidth = parseInt(selectedImage.style.width)
      const finalHeight = parseInt(selectedImage.style.height)
      
      if (!isNaN(finalWidth) && !isNaN(finalHeight)) {
        onResize(finalWidth, finalHeight)
      }
      
      setResizeState({
        isResizing: false,
        handle: null,
        startX: 0,
        startY: 0,
        startWidth: 0,
        startHeight: 0,
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizeState, selectedImage, onResize])

  if (!rect.visible) return null

  return (
    <div 
      className={`image-resizer ${resizeState.isResizing ? 'resizing' : ''}`}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
      }}
    >
      {/* Corner handles */}
      <div 
        className="resize-handle nw"
        onMouseDown={(e) => handleResizeStart(e, 'nw')}
      />
      <div 
        className="resize-handle ne"
        onMouseDown={(e) => handleResizeStart(e, 'ne')}
      />
      <div 
        className="resize-handle sw"
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
      />
      <div 
        className="resize-handle se"
        onMouseDown={(e) => handleResizeStart(e, 'se')}
      />

      {/* Size indicator */}
      {resizeState.isResizing && (
        <div className="size-indicator">
          {Math.round(rect.width)} × {Math.round(rect.height)}
        </div>
      )}
    </div>
  )
}

