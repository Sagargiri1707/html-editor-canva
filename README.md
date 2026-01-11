# WYSIWYG HTML Editor

A lightweight, Canva-like WYSIWYG HTML editor for React with a smooth editing experience.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-%3E%3D18.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-%3E%3D5.0.0-blue.svg)

## Features

- ✨ **Rich Text Formatting** - Bold, italic, underline, strikethrough
- 🎨 **Colors** - Text and background color picker
- 🔤 **Typography** - Font family, size, and alignment
- 📝 **Block Elements** - Headings, lists, blockquotes, code blocks
- 🔗 **Links** - Insert and edit hyperlinks
- 🖼️ **Media** - Image/video handling with resize support
- 🔄 **History** - Undo/Redo with keyboard shortcuts
- 🎯 **Drag & Drop** - Reorder content blocks
- 🛡️ **Security** - XSS protection via DOMPurify
- ♿ **Accessible** - ARIA labels and keyboard navigation
- 📦 **Lightweight** - No heavy dependencies

## Installation

```bash
npm install html-wysiwyg-editor
# or
yarn add html-wysiwyg-editor
# or
pnpm add html-wysiwyg-editor
```

## Quick Start

```tsx
import { WysiwygEditor } from 'html-wysiwyg-editor'
import 'html-wysiwyg-editor/style.css'

function App() {
  const [html, setHtml] = useState('<p>Hello World!</p>')

  return (
    <WysiwygEditor
      html={html}
      onChange={setHtml}
      placeholder="Start typing..."
    />
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `html` | `string` | **required** | The HTML content to edit |
| `onChange` | `(html: string) => void` | **required** | Callback fired when content changes |
| `placeholder` | `string` | `"Start typing..."` | Placeholder text when editor is empty |
| `debounceMs` | `number` | `300` | Debounce delay for onChange in ms |
| `assets` | `Asset[]` | `[]` | Available assets for media replacement |
| `onUpload` | `(file: File) => Promise<string>` | `undefined` | Callback for file uploads |

### Asset Type

```typescript
interface Asset {
  id: string
  url: string
  name: string
  type: 'image' | 'video'
}
```

## Usage Examples

### With File Upload

```tsx
import { WysiwygEditor } from 'html-wysiwyg-editor'
import 'html-wysiwyg-editor/style.css'

function App() {
  const [html, setHtml] = useState('')

  const handleUpload = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    
    const { url } = await response.json()
    return url
  }

  return (
    <WysiwygEditor
      html={html}
      onChange={setHtml}
      onUpload={handleUpload}
    />
  )
}
```

### With Asset Library

```tsx
const assets = [
  { id: '1', url: '/images/logo.png', name: 'Logo', type: 'image' },
  { id: '2', url: '/images/banner.jpg', name: 'Banner', type: 'image' },
]

<WysiwygEditor
  html={html}
  onChange={setHtml}
  assets={assets}
/>
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + B` | Bold |
| `⌘/Ctrl + I` | Italic |
| `⌘/Ctrl + U` | Underline |
| `⌘/Ctrl + K` | Insert link |
| `⌘/Ctrl + Z` | Undo |
| `⌘/Ctrl + Shift + Z` | Redo |
| `Delete` | Delete selected element |
| `Escape` | Deselect / Close menu |

## Customization

### CSS Variables

Override these CSS variables to customize the appearance:

```css
:root {
  --wysiwyg-font-family: 'Inter', system-ui, sans-serif;
  --wysiwyg-radius: 8px;
  --wysiwyg-radius-sm: 4px;
  --wysiwyg-color-accent: #6366f1;
  --wysiwyg-color-bg: #f5f5f7;
  --wysiwyg-color-surface: #ffffff;
  --wysiwyg-color-border: #e5e5e5;
  --wysiwyg-color-text: #1a1a1a;
  --wysiwyg-color-text-muted: #6b7280;
}
```

## Advanced Usage

### Using Hooks Directly

For custom implementations, you can use the internal hooks:

```tsx
import { useTextFormatting, useHistory, useDragAndDrop } from 'html-wysiwyg-editor'

function CustomEditor() {
  const editorRef = useRef<HTMLDivElement>(null)
  
  const { toggleBold, toggleItalic, setBlockType } = useTextFormatting({
    editorRef,
    onContentChange: () => { /* handle change */ }
  })

  const { undo, redo, canUndo, canRedo } = useHistory(initialHtml)

  // Build your custom UI...
}
```

### Sanitization Utilities

```tsx
import { sanitizeHtml, containsDangerousContent } from 'html-wysiwyg-editor'

// Check if content has XSS vectors
if (containsDangerousContent(userInput)) {
  console.warn('Dangerous content detected')
}

// Sanitize HTML
const safe = sanitizeHtml(userInput)
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

## License

MIT © [Your Organization]

