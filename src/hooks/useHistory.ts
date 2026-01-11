import { useState, useCallback, useRef, useEffect } from 'react'

interface UseHistoryOptions {
  maxHistory?: number
  debounceMs?: number
}

interface HistoryState {
  canUndo: boolean
  canRedo: boolean
}

export function useHistory(
  initialValue: string,
  options: UseHistoryOptions = {}
) {
  const { maxHistory = 50, debounceMs = 500 } = options
  
  // History stacks
  const undoStack = useRef<string[]>([])
  const redoStack = useRef<string[]>([])
  const currentValue = useRef(initialValue)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastPushedValue = useRef(initialValue)
  
  // State for UI updates
  const [historyState, setHistoryState] = useState<HistoryState>({
    canUndo: false,
    canRedo: false,
  })

  // Update UI state
  const updateHistoryState = useCallback(() => {
    setHistoryState({
      canUndo: undoStack.current.length > 0,
      canRedo: redoStack.current.length > 0,
    })
  }, [])

  // Push to history (debounced to avoid too many snapshots)
  const pushToHistory = useCallback((value: string) => {
    currentValue.current = value
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    // Debounce the actual push
    debounceTimer.current = setTimeout(() => {
      // Don't push if value is the same as last pushed
      if (value === lastPushedValue.current) {
        return
      }
      
      // Push previous value to undo stack
      undoStack.current.push(lastPushedValue.current)
      
      // Limit stack size
      if (undoStack.current.length > maxHistory) {
        undoStack.current.shift()
      }
      
      // Clear redo stack on new changes
      redoStack.current = []
      
      // Update last pushed value
      lastPushedValue.current = value
      
      updateHistoryState()
    }, debounceMs)
  }, [maxHistory, debounceMs, updateHistoryState])

  // Undo
  const undo = useCallback((): string | null => {
    if (undoStack.current.length === 0) {
      return null
    }
    
    // Pop from undo stack
    const previousValue = undoStack.current.pop()!
    
    // Push current to redo stack
    redoStack.current.push(lastPushedValue.current)
    
    // Update current and last pushed
    currentValue.current = previousValue
    lastPushedValue.current = previousValue
    
    updateHistoryState()
    
    return previousValue
  }, [updateHistoryState])

  // Redo
  const redo = useCallback((): string | null => {
    if (redoStack.current.length === 0) {
      return null
    }
    
    // Pop from redo stack
    const nextValue = redoStack.current.pop()!
    
    // Push current to undo stack
    undoStack.current.push(lastPushedValue.current)
    
    // Update current and last pushed
    currentValue.current = nextValue
    lastPushedValue.current = nextValue
    
    updateHistoryState()
    
    return nextValue
  }, [updateHistoryState])

  // Reset history
  const reset = useCallback((value: string) => {
    undoStack.current = []
    redoStack.current = []
    currentValue.current = value
    lastPushedValue.current = value
    updateHistoryState()
  }, [updateHistoryState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  return {
    pushToHistory,
    undo,
    redo,
    reset,
    canUndo: historyState.canUndo,
    canRedo: historyState.canRedo,
  }
}

