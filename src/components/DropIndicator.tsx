import './DropIndicator.css'

interface DropIndicatorProps {
  y: number | null
}

export function DropIndicator({ y }: DropIndicatorProps) {
  if (y === null) return null

  return (
    <div
      className="drop-indicator"
      style={{ top: y }}
    >
      <div className="drop-indicator-dot" />
      <div className="drop-indicator-line" />
      <div className="drop-indicator-dot" />
    </div>
  )
}

