import { useState, useCallback, useRef, RefObject, useEffect } from 'react'

interface DragState {
  isDragging: boolean
  draggedElement: HTMLElement | null
  dropIndicatorY: number | null
  dropTarget: HTMLElement | null
  dropPosition: 'before' | 'after' | null
}

interface UseDragAndDropOptions {
  editorRef: RefObject<HTMLDivElement | null>
  onContentChange: () => void
}

// Block-level elements that can be dragged
const DRAGGABLE_SELECTORS = 'p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, pre, figure, img, video, hr, table'

export function useDragAndDrop({ editorRef, onContentChange }: UseDragAndDropOptions) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedElement: null,
    dropIndicatorY: null,
    dropTarget: null,
    dropPosition: null,
  })
  
  const dragGhostRef = useRef<HTMLDivElement | null>(null)

  // Find the block-level parent of an element
  const findBlockParent = useCallback((element: HTMLElement): HTMLElement | null => {
    if (!editorRef.current) return null
    
    let current: HTMLElement | null = element
    while (current && current !== editorRef.current) {
      if (current.parentElement === editorRef.current && current.matches(DRAGGABLE_SELECTORS)) {
        return current
      }
      current = current.parentElement
    }
    return null
  }, [editorRef])

  // Get all block elements in the editor
  const getBlockElements = useCallback((): HTMLElement[] => {
    if (!editorRef.current) return []
    return Array.from(editorRef.current.querySelectorAll(`:scope > ${DRAGGABLE_SELECTORS}`))
  }, [editorRef])

  // Create drag ghost element
  const createDragGhost = useCallback((element: HTMLElement) => {
    const ghost = document.createElement('div')
    ghost.className = 'drag-ghost'
    ghost.innerHTML = element.outerHTML
    ghost.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.8;
      transform: scale(0.95);
      max-width: 400px;
      background: var(--color-surface);
      border: 1px solid var(--color-accent);
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    `
    document.body.appendChild(ghost)
    dragGhostRef.current = ghost
    return ghost
  }, [])

  // Remove drag ghost
  const removeDragGhost = useCallback(() => {
    if (dragGhostRef.current) {
      dragGhostRef.current.remove()
      dragGhostRef.current = null
    }
  }, [])

  // Update ghost position
  const updateGhostPosition = useCallback((x: number, y: number) => {
    if (dragGhostRef.current) {
      dragGhostRef.current.style.left = `${x + 10}px`
      dragGhostRef.current.style.top = `${y + 10}px`
    }
  }, [])

  // Calculate drop position
  const calculateDropPosition = useCallback((y: number, blocks: HTMLElement[], draggedElement: HTMLElement) => {
    let dropTarget: HTMLElement | null = null
    let dropPosition: 'before' | 'after' | null = null
    let indicatorY: number | null = null

    for (const block of blocks) {
      if (block === draggedElement) continue
      
      const rect = block.getBoundingClientRect()
      const midY = rect.top + rect.height / 2

      if (y < midY) {
        dropTarget = block
        dropPosition = 'before'
        indicatorY = rect.top
        break
      } else {
        dropTarget = block
        dropPosition = 'after'
        indicatorY = rect.bottom
      }
    }

    return { dropTarget, dropPosition, indicatorY }
  }, [])

  // Handle drag start
  const handleDragStart = useCallback((element: HTMLElement, e: MouseEvent) => {
    const block = findBlockParent(element)
    if (!block) return

    e.preventDefault()
    
    // Create ghost
    createDragGhost(block)
    updateGhostPosition(e.clientX, e.clientY)
    
    // Add dragging class to original
    block.classList.add('dragging')
    
    setDragState({
      isDragging: true,
      draggedElement: block,
      dropIndicatorY: null,
      dropTarget: null,
      dropPosition: null,
    })
  }, [findBlockParent, createDragGhost, updateGhostPosition])

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedElement) return

    updateGhostPosition(e.clientX, e.clientY)
    
    const blocks = getBlockElements()
    const { dropTarget, dropPosition, indicatorY } = calculateDropPosition(
      e.clientY,
      blocks,
      dragState.draggedElement
    )

    setDragState(prev => ({
      ...prev,
      dropTarget,
      dropPosition,
      dropIndicatorY: indicatorY,
    }))
  }, [dragState.isDragging, dragState.draggedElement, updateGhostPosition, getBlockElements, calculateDropPosition])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging) return

    const { draggedElement, dropTarget, dropPosition } = dragState

    // Remove visual feedback
    if (draggedElement) {
      draggedElement.classList.remove('dragging')
    }
    removeDragGhost()

    // Perform the move if we have a valid drop target
    if (draggedElement && dropTarget && dropPosition && editorRef.current) {
      if (dropPosition === 'before') {
        dropTarget.parentElement?.insertBefore(draggedElement, dropTarget)
      } else {
        dropTarget.parentElement?.insertBefore(draggedElement, dropTarget.nextSibling)
      }
      
      // Notify of content change
      onContentChange()
    }

    setDragState({
      isDragging: false,
      draggedElement: null,
      dropIndicatorY: null,
      dropTarget: null,
      dropPosition: null,
    })
  }, [dragState, removeDragGhost, editorRef, onContentChange])

  // Set up global mouse listeners when dragging
  useEffect(() => {
    if (dragState.isDragging) {
      const handleMouseMove = (e: MouseEvent) => handleDragMove(e)
      const handleMouseUp = () => handleDragEnd()

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragState.isDragging, handleDragMove, handleDragEnd])

  return {
    dragState,
    handleDragStart,
    findBlockParent,
  }
}

