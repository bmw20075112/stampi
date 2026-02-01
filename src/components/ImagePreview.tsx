import { useEffect, useRef } from 'react'
import { TimestampConfig, renderTimestamp } from '../utils/imageProcessor'

interface ImagePreviewProps {
  imageUrl: string
  timestamp: string | null
  config: TimestampConfig
}

export default function ImagePreview({ imageUrl, timestamp, config }: ImagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!timestamp) return

    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      imageRef.current = image
      if (canvasRef.current) {
        renderTimestamp(canvasRef.current, image, timestamp, config)
      }
    }
    image.src = imageUrl
  }, [imageUrl, timestamp, config])

  const handleDownload = () => {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    link.download = 'time-image.jpg'
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95)
    link.click()
  }

  if (!timestamp) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <svg
          className="w-12 h-12 text-yellow-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-yellow-700 dark:text-yellow-300 text-center">
          無法讀取拍攝時間
        </p>
        <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center mt-1">
          此圖片可能沒有 EXIF 資料
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas
        ref={canvasRef}
        data-testid="preview-canvas"
        className="max-w-full h-auto rounded-lg shadow-lg"
      />
      <button
        onClick={handleDownload}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        下載圖片
      </button>
    </div>
  )
}
