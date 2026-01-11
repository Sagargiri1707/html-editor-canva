# Testing Guide - Version 1.0.2

## Quick Test with npm link

Since the package is already linked globally, you can test it in your client repo:

```bash
# In your client repo
cd /path/to/your/client-repo
npm link html-wysiwyg-editor
```

## What to Test

### 1. CSS Isolation ✅
**Test:** Use the editor in a page with Tailwind CSS or Bootstrap
- The editor should maintain its styling
- Buttons, inputs, and popovers should look correct
- No utility classes should interfere with editor appearance

### 2. Image Loading ✅
**Test:** Add images to the editor
```tsx
<WysiwygEditor
  html='<p>Test</p><img src="https://picsum.photos/400/300" alt="Test" />'
  onChange={setHtml}
/>
```
- Images should load and display properly
- Images should be responsive (max-width: 100%)
- Images should have proper object-fit

### 3. Drag Handle Visibility ✅
**Test:** Hover over content blocks
- Drag handle (⋮⋮) should appear on the left side
- Handle should be visible even when editor is in a constrained container
- Handle should work for reordering blocks

### 4. Width Constraints ✅
**Test:** Place editor in different container widths
```tsx
{/* Narrow container */}
<div style={{ width: '400px' }}>
  <WysiwygEditor html={html} onChange={setHtml} />
</div>

{/* Wide container */}
<div style={{ width: '100%' }}>
  <WysiwygEditor html={html} onChange={setHtml} />
</div>
```
- Editor should be max 900px wide
- Editor should be responsive below 900px
- Should look good in all container sizes

### 5. External Dependencies (CDN) ✅
**Test:** Content with CDN resources
```tsx
const htmlWithCDN = `
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <div class="bg-blue-500 text-white p-4">
    Tailwind styled content
  </div>
`
<WysiwygEditor html={htmlWithCDN} onChange={setHtml} />
```
- CDN resources should load
- Content should render with external styles
- Editor UI should remain unaffected

### 6. Scrolling ✅
**Test:** Add lots of content
- Editor should scroll when content exceeds 600px height
- Scrollbar should be styled nicely
- Scroll should be smooth

### 7. Popovers & Toolbars ✅
**Test:** Select text and use formatting
- Floating toolbar should appear above selection
- Link popover should open when clicking link button
- Color picker should display correctly
- Font picker should work
- All popovers should be above page content (high z-index)

## Example Test Component

```tsx
import { useState } from 'react'
import { WysiwygEditor } from 'html-wysiwyg-editor'
import 'html-wysiwyg-editor/style.css'

function TestEditor() {
  const [html, setHtml] = useState(`
    <h1>Test Editor</h1>
    <p>This is a test paragraph.</p>
    <img src="https://picsum.photos/400/300" alt="Test Image" />
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
  `)

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Editor Test</h1>
      
      {/* Test in Tailwind environment */}
      <div className="bg-gray-100 p-4 rounded">
        <WysiwygEditor
          html={html}
          onChange={setHtml}
          placeholder="Start typing..."
        />
      </div>

      {/* Output preview */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-2">Output:</h2>
        <pre className="bg-gray-800 text-white p-4 rounded overflow-auto">
          {html}
        </pre>
      </div>
    </div>
  )
}

export default TestEditor
```

## Expected Results

✅ All UI elements visible and functional
✅ Images load and display correctly
✅ Drag handle appears on hover
✅ Editor respects max-width of 900px
✅ External styles don't interfere with editor
✅ Scrolling works smoothly
✅ All popovers and toolbars appear correctly

## Common Issues & Solutions

### Issue: Images not loading
**Solution:** Check CORS headers on image URLs. Use `crossorigin="anonymous"` if needed.

### Issue: Drag handle not visible
**Solution:** Ensure the editor container has enough space on the left (at least 40px margin).

### Issue: External styles affecting editor
**Solution:** The new `EditorIsolation.css` should prevent this. If issues persist, check browser dev tools for specificity conflicts.

### Issue: Popovers hidden behind other elements
**Solution:** The editor uses z-index values from 999,996 to 1,000,000. If still hidden, check for parent elements with higher z-index.

## Unlink When Done

```bash
# In your client repo
npm unlink html-wysiwyg-editor
npm install html-wysiwyg-editor@1.0.2
```

## Publish to npm

Once testing is complete:

```bash
cd /Users/sagar.giri/Documents/html-editor-canva
npm publish
```

