# Changelog

All notable changes to this project will be documented in this file.

## [1.0.2] - 2026-01-11

### Fixed
- **CSS Isolation**: Added comprehensive `EditorIsolation.css` layer to prevent external CSS (Tailwind, Bootstrap, etc.) from overriding editor styles
- **Image Loading**: Fixed images not loading properly in client apps by ensuring proper display properties, object-fit, and data URI support
- **Drag Handle Visibility**: Fixed drag handle not appearing by improving positioning logic to account for viewport boundaries
- **Max Width**: Restored `max-width: 900px` for better layout control while maintaining responsive width
- **External Dependencies**: Allowed safe loading of CDN resources (Tailwind, Swiper, etc.) through improved sanitization

### Added
- `EditorIsolation.css` - New CSS isolation layer using `all: revert` and `!important` rules
- Support for `<link>` and `<script>` tags with proper sanitization for CDN resources
- Additional allowed attributes: `crossorigin`, `integrity`, `async`, `defer`, `charset`, `type`
- Data URI support for images in sanitization

### Changed
- All toolbar, popover, and UI element styles now use `!important` to ensure they work in any environment
- Added explicit `box-sizing: border-box` to all elements
- Improved image rendering with `display: block`, `object-fit: contain`, and proper backgrounds
- Drag handle positioning now uses `Math.max(8, editorRect.left - 36)` to ensure visibility
- Enhanced CSS specificity to prevent conflicts with global styles
- Sanitizer now allows safe external resources while maintaining XSS protection

## [1.0.1] - 2026-01-11

### Fixed
- **Popover visibility**: Increased z-index values significantly (999,996 - 1,000,000) to ensure all UI elements (floating toolbar, link popover, color picker, font picker, insert menu, etc.) appear above client application content
- **Scrolling**: Added `overflow-y: auto` to the editor with a max-height of 600px to enable scrolling for long content
- **Width constraints**: Removed `max-width: 800px` from the editor wrapper to allow it to take 100% of available container width
- **CSS variable fallbacks**: Added fallback values for all CSS variables to ensure the editor works even when variables are not defined in the client app

### Changed
- Editor wrapper now uses `display: flex` and `flex-direction: column` for better layout control
- All fixed-position elements (toolbars, popovers, overlays) now have `pointer-events: auto` to ensure proper interaction
- Added custom scrollbar styling for better UX on webkit browsers

### Technical Details

#### Z-Index Hierarchy
- Shortcuts overlay: `1,000,000`
- All popovers & pickers: `999,999`
- Floating toolbar & media toolbar: `999,998`
- Drag handle & image resizer: `999,997`
- Drop indicator: `999,996`
- Warning banner: `999,999`

#### CSS Variables with Fallbacks
All components now include fallback values:
- `var(--color-surface, #ffffff)`
- `var(--color-border, #e0e0e0)`
- `var(--color-accent, #4f46e5)`
- etc.

This ensures the editor renders correctly even in environments where CSS variables are not defined.

## [1.0.0] - 2026-01-11

### Added
- Initial release
- Rich text formatting (bold, italic, underline, strikethrough)
- Text and background color picker
- Font family and size selection
- Text alignment options
- Block elements (headings, paragraphs, lists)
- Link insertion and editing
- Image and video support with resize handles
- Media replacement from asset library
- File upload support
- Drag and drop block reordering
- Undo/redo with history management
- Keyboard shortcuts
- XSS protection via DOMPurify
- Accessibility features
- TypeScript support

