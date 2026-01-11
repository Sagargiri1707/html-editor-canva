import { useState, useEffect, useCallback } from 'react'
import './MediaToolbar.css'

interface Asset {
  id: string
  url: string
  name: string
  type: 'image' | 'video'
}

interface MediaToolbarProps {
  selectedElement: HTMLImageElement | HTMLVideoElement | null
  assets: Asset[]
  onReplace: (url: string) => void
  onDelete: () => void
  onUpload?: (file: File) => Promise<string>
}

interface Position {
  x: number
  y: number
  visible: boolean
}

export function MediaToolbar({
  selectedElement,
  assets,
  onReplace,
  onDelete,
  onUpload,
}: MediaToolbarProps) {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0, visible: false })
  const [showAssetPicker, setShowAssetPicker] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Update position when selected element changes
  const updatePosition = useCallback(() => {
    if (!selectedElement) {
      setPosition(prev => ({ ...prev, visible: false }))
      return
    }

    const rect = selectedElement.getBoundingClientRect()
    const toolbarHeight = 44
    const gap = 8

    let x = rect.left + (rect.width / 2) - 100 // center toolbar
    let y = rect.top - toolbarHeight - gap

    // Keep within viewport
    const padding = 8
    x = Math.max(padding, Math.min(x, window.innerWidth - 200 - padding))

    if (y < padding) {
      y = rect.bottom + gap
    }

    setPosition({ x, y, visible: true })
  }, [selectedElement])

  useEffect(() => {
    updatePosition()
    
    const handleScroll = () => updatePosition()
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', updatePosition)
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [updatePosition])

  // Close asset picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest('.asset-picker') && !target.closest('.media-toolbar')) {
        setShowAssetPicker(false)
      }
    }

    if (showAssetPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAssetPicker])

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onUpload) return

    setIsUploading(true)
    try {
      const url = await onUpload(file)
      onReplace(url)
      setShowAssetPicker(false)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  if (!position.visible) {
    return null
  }

  const isImage = selectedElement?.tagName === 'IMG'
  const currentSrc = selectedElement?.getAttribute('src') || ''

  return (
    <>
      <div
        className="media-toolbar"
        style={{
          left: position.x,
          top: position.y,
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <button
          type="button"
          className="media-btn"
          onClick={() => setShowAssetPicker(!showAssetPicker)}
          title="Replace media"
        >
          🔄 Replace
        </button>
        <div className="toolbar-divider" />
        <button
          type="button"
          className="media-btn media-btn-danger"
          onClick={onDelete}
          title="Delete media"
        >
          🗑️
        </button>
      </div>

      {showAssetPicker && (
        <div
          className="asset-picker"
          style={{
            left: position.x,
            top: position.y + 52,
          }}
        >
          <div className="asset-picker-header">
            <span className="asset-picker-title">
              {isImage ? 'Replace Image' : 'Replace Video'}
            </span>
            <button
              type="button"
              className="asset-picker-close"
              onClick={() => setShowAssetPicker(false)}
            >
              ✕
            </button>
          </div>

          {/* Upload option */}
          {onUpload && (
            <div className="asset-upload">
              <label className="upload-btn">
                {isUploading ? 'Uploading...' : '📤 Upload new'}
                <input
                  type="file"
                  accept={isImage ? 'image/*' : 'video/*'}
                  onChange={handleFileChange}
                  disabled={isUploading}
                  hidden
                />
              </label>
            </div>
          )}

          {/* Asset library */}
          {assets.length > 0 && (
            <>
              <div className="asset-divider">or choose from library</div>
              <div className="asset-grid">
                {assets
                  .filter(a => (isImage ? a.type === 'image' : a.type === 'video'))
                  .map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      className={`asset-item ${asset.url === currentSrc ? 'active' : ''}`}
                      onClick={() => {
                        onReplace(asset.url)
                        setShowAssetPicker(false)
                      }}
                      title={asset.name}
                    >
                      {asset.type === 'image' ? (
                        <img src={asset.url} alt={asset.name} />
                      ) : (
                        <video src={asset.url} />
                      )}
                    </button>
                  ))}
              </div>
            </>
          )}

          {assets.length === 0 && !onUpload && (
            <div className="asset-empty">No assets available</div>
          )}
        </div>
      )}
    </>
  )
}

