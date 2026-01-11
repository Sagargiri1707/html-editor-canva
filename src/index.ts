// Main component export
export { WysiwygEditor } from './components/WysiwygEditor'

// Types
export type { Asset, WysiwygEditorProps } from './components/WysiwygEditor'

// Utility exports (for advanced users)
export { sanitizeHtml, sanitizeForOutput, containsDangerousContent } from './utils/sanitize'

// Hook exports (for custom implementations)
export { useHistory } from './hooks/useHistory'
export { useTextFormatting } from './hooks/useTextFormatting'
export { useDragAndDrop } from './hooks/useDragAndDrop'

