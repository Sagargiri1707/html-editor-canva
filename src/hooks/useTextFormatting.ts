import { useCallback, useEffect, RefObject } from 'react'

type FormatCommand = 'bold' | 'italic' | 'underline' | 'strikeThrough'
type BlockType = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type ListType = 'insertUnorderedList' | 'insertOrderedList'

interface UseTextFormattingOptions {
  editorRef: RefObject<HTMLDivElement | null>
  onContentChange: () => void
}

export function useTextFormatting({ editorRef, onContentChange }: UseTextFormattingOptions) {
  // Execute a formatting command
  const executeFormat = useCallback((command: FormatCommand) => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus()
    }
    
    document.execCommand(command, false)
    onContentChange()
  }, [editorRef, onContentChange])

  // Check if a format is currently active at cursor position
  const isFormatActive = useCallback((command: FormatCommand): boolean => {
    return document.queryCommandState(command)
  }, [])

  // Get current block type
  const getCurrentBlockType = useCallback((): BlockType => {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return 'p'
    
    let node: Node | null = selection.anchorNode
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = (node as Element).tagName.toLowerCase()
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(tagName)) {
          return tagName as BlockType
        }
      }
      node = node.parentNode
    }
    return 'p'
  }, [editorRef])

  // Set block type (heading or paragraph)
  const setBlockType = useCallback((type: BlockType) => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus()
    }
    
    document.execCommand('formatBlock', false, type)
    onContentChange()
  }, [editorRef, onContentChange])

  // Toggle list type
  const toggleList = useCallback((listType: ListType) => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus()
    }
    
    document.execCommand(listType, false)
    onContentChange()
  }, [editorRef, onContentChange])

  // Check if currently in a list
  const isInList = useCallback((listType: 'ul' | 'ol'): boolean => {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return false
    
    let node: Node | null = selection.anchorNode
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = (node as Element).tagName.toLowerCase()
        if (tagName === listType) return true
      }
      node = node.parentNode
    }
    return false
  }, [editorRef])

  // Check if currently in a link
  const getCurrentLink = useCallback((): string | null => {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return null
    
    let node: Node | null = selection.anchorNode
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'A') {
        return (node as HTMLAnchorElement).href
      }
      node = node.parentNode
    }
    return null
  }, [editorRef])

  // Insert or update link
  const insertLink = useCallback((url: string) => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus()
    }
    
    document.execCommand('createLink', false, url)
    onContentChange()
  }, [editorRef, onContentChange])

  // Remove link
  const removeLink = useCallback(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus()
    }
    
    document.execCommand('unlink', false)
    onContentChange()
  }, [editorRef, onContentChange])

  // Set text color
  const setTextColor = useCallback((color: string) => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus()
    }
    
    if (color) {
      document.execCommand('foreColor', false, color)
    } else {
      document.execCommand('removeFormat', false)
    }
    onContentChange()
  }, [editorRef, onContentChange])

  // Set background color
  const setBackgroundColor = useCallback((color: string) => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus()
    }
    
    if (color) {
      document.execCommand('hiliteColor', false, color)
    } else {
      document.execCommand('removeFormat', false)
    }
    onContentChange()
  }, [editorRef, onContentChange])

  // Get current text color
  const getCurrentTextColor = useCallback((): string => {
    const color = document.queryCommandValue('foreColor')
    // Convert RGB to hex if needed
    if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g)
      if (match) {
        const [r, g, b] = match.map(Number)
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
      }
    }
    return color || ''
  }, [])

  // Get current background color
  const getCurrentBackgroundColor = useCallback((): string => {
    const color = document.queryCommandValue('backColor')
    // Convert RGB to hex if needed
    if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g)
      if (match) {
        const [r, g, b] = match.map(Number)
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
      }
    }
    return color || ''
  }, [])

  // Set font family
  const setFontFamily = useCallback((font: string) => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus()
    }
    
    if (font) {
      document.execCommand('fontName', false, font)
    }
    onContentChange()
  }, [editorRef, onContentChange])

  // Set font size
  const setFontSize = useCallback((size: string) => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus()
    }
    
    // document.execCommand('fontSize') uses 1-7 scale, so we use a span approach
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0)
      const span = document.createElement('span')
      span.style.fontSize = size
      
      try {
        range.surroundContents(span)
        selection.removeAllRanges()
        const newRange = document.createRange()
        newRange.selectNodeContents(span)
        selection.addRange(newRange)
      } catch {
        // If surroundContents fails (e.g., partial node selection), 
        // fall back to execCommand with closest size
        const sizeNum = parseInt(size)
        let fontSize = 3 // default
        if (sizeNum <= 12) fontSize = 1
        else if (sizeNum <= 14) fontSize = 2
        else if (sizeNum <= 16) fontSize = 3
        else if (sizeNum <= 18) fontSize = 4
        else if (sizeNum <= 24) fontSize = 5
        else if (sizeNum <= 32) fontSize = 6
        else fontSize = 7
        document.execCommand('fontSize', false, String(fontSize))
      }
    }
    
    onContentChange()
  }, [editorRef, onContentChange])

  // Get current font family
  const getCurrentFontFamily = useCallback((): string => {
    return document.queryCommandValue('fontName') || ''
  }, [])

  // Get current font size
  const getCurrentFontSize = useCallback((): string => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      let node: Node | null = selection.anchorNode
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const style = window.getComputedStyle(node as Element)
          const size = style.fontSize
          if (size) return size
        }
        node = node.parentNode
      }
    }
    return ''
  }, [editorRef])

  // Text alignment
  type Alignment = 'left' | 'center' | 'right' | 'justify'
  
  const setAlignment = useCallback((alignment: Alignment) => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus()
    }
    
    document.execCommand('justify' + alignment.charAt(0).toUpperCase() + alignment.slice(1), false)
    onContentChange()
  }, [editorRef, onContentChange])

  const getCurrentAlignment = useCallback((): Alignment => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      let node: Node | null = selection.anchorNode
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const style = window.getComputedStyle(node as Element)
          const textAlign = style.textAlign
          if (textAlign === 'center' || textAlign === 'right' || textAlign === 'justify') {
            return textAlign as Alignment
          }
          if (textAlign === 'start' || textAlign === 'left') {
            return 'left'
          }
        }
        node = node.parentNode
      }
    }
    return 'left'
  }, [editorRef])

  // Insert blockquote
  const insertBlockquote = useCallback(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus()
    }
    
    document.execCommand('formatBlock', false, 'blockquote')
    onContentChange()
  }, [editorRef, onContentChange])

  // Insert code block
  const insertCodeBlock = useCallback(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus()
    }
    
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const pre = document.createElement('pre')
      const code = document.createElement('code')
      
      // Get selected text or use placeholder
      const selectedText = range.toString() || 'Code here...'
      code.textContent = selectedText
      pre.appendChild(code)
      
      range.deleteContents()
      range.insertNode(pre)
      
      // Move cursor inside code block
      const newRange = document.createRange()
      newRange.selectNodeContents(code)
      selection.removeAllRanges()
      selection.addRange(newRange)
    }
    
    onContentChange()
  }, [editorRef, onContentChange])

  // Insert horizontal rule
  const insertHorizontalRule = useCallback(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus()
    }
    
    document.execCommand('insertHorizontalRule', false)
    onContentChange()
  }, [editorRef, onContentChange])

  // Check if currently in blockquote
  const isInBlockquote = useCallback((): boolean => {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return false
    
    let node: Node | null = selection.anchorNode
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'BLOCKQUOTE') {
        return true
      }
      node = node.parentNode
    }
    return false
  }, [editorRef])

  // Check if currently in code block
  const isInCodeBlock = useCallback((): boolean => {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return false
    
    let node: Node | null = selection.anchorNode
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = (node as Element).tagName
        if (tagName === 'PRE' || tagName === 'CODE') {
          return true
        }
      }
      node = node.parentNode
    }
    return false
  }, [editorRef])

  // Format actions
  const toggleBold = useCallback(() => executeFormat('bold'), [executeFormat])
  const toggleItalic = useCallback(() => executeFormat('italic'), [executeFormat])
  const toggleUnderline = useCallback(() => executeFormat('underline'), [executeFormat])
  const toggleStrikethrough = useCallback(() => executeFormat('strikeThrough'), [executeFormat])
  const toggleBulletList = useCallback(() => toggleList('insertUnorderedList'), [toggleList])
  const toggleNumberedList = useCallback(() => toggleList('insertOrderedList'), [toggleList])

  // Keyboard shortcut handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!editorRef.current?.contains(document.activeElement)) {
      return
    }

    const isMac = navigator.platform.toUpperCase().includes('MAC')
    const modifier = isMac ? e.metaKey : e.ctrlKey

    if (!modifier) return

    switch (e.key.toLowerCase()) {
      case 'b':
        e.preventDefault()
        toggleBold()
        break
      case 'i':
        e.preventDefault()
        toggleItalic()
        break
      case 'u':
        e.preventDefault()
        toggleUnderline()
        break
    }

    // Heading shortcuts: Ctrl/Cmd + Shift + 1-6
    if (e.shiftKey && /^[1-6]$/.test(e.key)) {
      e.preventDefault()
      setBlockType(`h${e.key}` as BlockType)
    }

    // Paragraph: Ctrl/Cmd + Shift + 0
    if (e.shiftKey && e.key === '0') {
      e.preventDefault()
      setBlockType('p')
    }
  }, [editorRef, toggleBold, toggleItalic, toggleUnderline, setBlockType])

  // Attach keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrikethrough,
    toggleBulletList,
    toggleNumberedList,
    setBlockType,
    getCurrentBlockType,
    isFormatActive,
    isInList,
    insertLink,
    removeLink,
    getCurrentLink,
    setTextColor,
    setBackgroundColor,
    getCurrentTextColor,
    getCurrentBackgroundColor,
    setFontFamily,
    setFontSize,
    getCurrentFontFamily,
    getCurrentFontSize,
    setAlignment,
    getCurrentAlignment,
    insertBlockquote,
    insertCodeBlock,
    insertHorizontalRule,
    isInBlockquote,
    isInCodeBlock,
  }
}
