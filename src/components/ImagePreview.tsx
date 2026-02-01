import { useEffect, useRef } from 'react'
import { renderTimestamp } from '../utils/imageProcessor'
import type { TimestampConfig } from '../utils/imageProcessor'

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
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
        <svg
          className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500 mb-3"
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
        <p className="text-amber-700 dark:text-amber-300 text-center font-medium">
          無法讀取拍攝時間
        </p>
        <p className="text-sm text-amber-600 dark:text-amber-400 text-center mt-1">
          此圖片可能沒有 EXIF 資料
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <canvas
          ref={canvasRef}
          data-testid="preview-canvas"
          className="max-w-full h-auto rounded-lg mx-auto"
        />
      </div>
      <button
        onClick={handleDownload}
        className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        下載圖片
      </button>
    </div>
  )
}
