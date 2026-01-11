# Integration Guide

This guide helps you integrate the WYSIWYG editor into your application, especially when dealing with CSS frameworks like Tailwind, Bootstrap, or custom global styles.

## Quick Start

```tsx
import { WysiwygEditor } from 'html-wysiwyg-editor'
import 'html-wysiwyg-editor/style.css'

function MyComponent() {
  const [html, setHtml] = useState('<p>Hello World!</p>')

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <WysiwygEditor
        html={html}
        onChange={setHtml}
        placeholder="Start typing..."
      />
    </div>
  )
}
```

## CSS Framework Integration

### With Tailwind CSS

The editor is designed to work seamlessly with Tailwind. All critical styles use `!important` to prevent Tailwind's reset from affecting the editor.

```tsx
<div className="container mx-auto px-4 py-8">
  <WysiwygEditor html={html} onChange={setHtml} />
</div>
```

**Important:** Make sure to import the editor's CSS **after** Tailwind:

```tsx
import 'tailwindcss/tailwind.css'
import 'html-wysiwyg-editor/style.css' // Import after Tailwind
```

### With Bootstrap

Similar to Tailwind, import the editor CSS after Bootstrap:

```tsx
import 'bootstrap/dist/css/bootstrap.min.css'
import 'html-wysiwyg-editor/style.css'
```

### With Custom Global Styles

If you have aggressive global CSS resets or styles, the editor should still work due to `!important` flags on critical styles. However, if you encounter issues:

1. **Wrap the editor in an isolated container:**

```tsx
<div className="wysiwyg-container">
  <WysiwygEditor html={html} onChange={setHtml} />
</div>
```

```css
.wysiwyg-container {
  isolation: isolate;
  position: relative;
}
```

2. **Ensure CSS import order:**

```tsx
// Your global styles
import './globals.css'
// Editor styles (should come last)
import 'html-wysiwyg-editor/style.css'
```

## Handling External Content

The editor is designed to handle HTML content that may include external dependencies like:

- Tailwind utility classes
- Bootstrap components
- Swiper.js via CDN
- Custom fonts and styles

### Example with External Dependencies

```tsx
const htmlWithExternalDeps = `
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
  <div class="swiper">
    <div class="swiper-wrapper">
      <div class="swiper-slide">Slide 1</div>
      <div class="swiper-slide">Slide 2</div>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
`

<WysiwygEditor html={htmlWithExternalDeps} onChange={setHtml} />
```

The editor will preserve these external dependencies and render them correctly.

## Image Handling

### Images Not Loading?

If images aren't loading in your client app, ensure:

1. **Correct image URLs:**
```tsx
// ✅ Good - absolute URLs
<img src="https://example.com/image.jpg" />
<img src="/api/images/123" />

// ❌ Bad - relative URLs without proper base
<img src="images/photo.jpg" />
```

2. **CORS headers** if loading from external domains

3. **Proper image upload handler:**

```tsx
const handleUpload = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })
  
  const { url } = await response.json()
  return url // Must return absolute URL
}

<WysiwygEditor
  html={html}
  onChange={setHtml}
  onUpload={handleUpload}
/>
```

## Drag Handle Not Appearing?

The drag handle appears when you hover over content blocks. If it's not showing:

1. **Check z-index conflicts:**
The editor uses z-index values from 999,996 to 1,000,000. Ensure your app doesn't use higher values.

2. **Check positioning context:**
The drag handle uses `position: fixed`. Ensure there are no CSS transforms on parent elements that create new stacking contexts.

3. **Verify hover is working:**
The drag handle only appears on hover. Test by moving your mouse slowly over paragraphs and headings.

## Width and Layout

### Default Behavior

The editor has a `max-width: 900px` and takes 100% width of its container up to that limit.

### Custom Width

```tsx
// Full width
<div style={{ maxWidth: 'none' }}>
  <WysiwygEditor html={html} onChange={setHtml} />
</div>

// Custom max width
<div style={{ maxWidth: '1200px' }}>
  <WysiwygEditor html={html} onChange={setHtml} />
</div>
```

Or override with CSS:

```css
.wysiwyg-editor-wrapper {
  max-width: 1200px !important;
}
```

## Scrolling

The editor has a default `max-height: 600px` and scrolls internally. To customize:

```css
.wysiwyg-editor {
  max-height: 800px !important;
}

/* Or remove max-height for auto-height */
.wysiwyg-editor {
  max-height: none !important;
  min-height: 200px !important;
}
```

## Customizing Appearance

### Colors

```css
:root {
  --color-accent: #6366f1;
  --color-accent-hover: #818cf8;
  --color-surface: #ffffff;
  --color-bg: #f9fafb;
  --color-border: #e5e7eb;
  --color-text: #111827;
  --color-text-muted: #6b7280;
}
```

### Fonts

```css
:root {
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### Border Radius

```css
:root {
  --radius: 12px;
  --radius-sm: 6px;
}
```

## Troubleshooting

### Popovers Not Showing

- Ensure no parent element has `overflow: hidden`
- Check z-index conflicts
- Verify the editor CSS is imported

### Styles Look Broken

- Check CSS import order (editor CSS should come last)
- Ensure no global CSS resets are too aggressive
- Try wrapping in an isolated container

### Content Not Saving

- Verify `onChange` handler is called
- Check debounce settings (default 300ms)
- Ensure HTML is being sanitized properly

### Performance Issues

- Reduce `debounceMs` for faster updates
- Limit history size: The editor keeps 50 history states by default
- Avoid extremely large HTML content (>1MB)

## Best Practices

1. **Always sanitize user input** - The editor uses DOMPurify, but sanitize on the backend too
2. **Use absolute URLs for images** - Relative URLs may break in different contexts
3. **Test with your CSS framework** - Ensure compatibility before deploying
4. **Provide upload handler** - For better UX with image uploads
5. **Set appropriate max-width** - Based on your layout requirements

## Example: Complete Integration

```tsx
import { useState } from 'react'
import { WysiwygEditor } from 'html-wysiwyg-editor'
import 'html-wysiwyg-editor/style.css'

export default function BlogEditor() {
  const [content, setContent] = useState('')
  const [assets] = useState([
    { id: '1', url: '/images/logo.png', name: 'Logo', type: 'image' },
    { id: '2', url: '/images/banner.jpg', name: 'Banner', type: 'image' },
  ])

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    
    const { url } = await res.json()
    return url
  }

  const handleSave = async () => {
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <button onClick={handleSave} className="btn btn-primary">
          Save Post
        </button>
      </div>
      
      <WysiwygEditor
        html={content}
        onChange={setContent}
        placeholder="Write your blog post..."
        debounceMs={500}
        assets={assets}
        onUpload={handleUpload}
      />
    </div>
  )
}
```

## Support

If you encounter issues not covered in this guide, please:
1. Check the [GitHub Issues](https://github.com/your-org/wysiwyg-editor/issues)
2. Review the [CHANGELOG](./CHANGELOG.md) for recent fixes
3. Open a new issue with a minimal reproduction

## Version Compatibility

- React: >=18.0.0
- TypeScript: >=5.0.0
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

