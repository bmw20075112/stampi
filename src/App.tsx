import { useState, useMemo } from 'react'
import ImageUploader from './components/ImageUploader'
import ImagePreview from './components/ImagePreview'
import TimestampEditor from './components/TimestampEditor'
import useExifData from './hooks/useExifData'
import { formatDate } from './utils/dateFormatter'
import { TimestampConfig, calculateFontSize } from './utils/imageProcessor'

const DEFAULT_CONFIG: TimestampConfig = {
  format: 'YYYY/MM/DD',
  position: 'bottom-right',
  color: '#FF6B35',
  fontSize: 30,
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [config, setConfig] = useState<TimestampConfig>(DEFAULT_CONFIG)

  const { date, loading } = useExifData(file)

  const timestamp = useMemo(() => {
    if (!date) return null
    return formatDate(date, config.format)
  }, [date, config.format])

  const handleImageSelect = (selectedFile: File) => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
    }
    setFile(selectedFile)
    setImageUrl(URL.createObjectURL(selectedFile))

    // Calculate default font size based on image
    const img = new Image()
    img.onload = () => {
      const fontSize = calculateFontSize(img.naturalWidth)
      setConfig((prev) => ({ ...prev, fontSize }))
    }
    img.src = URL.createObjectURL(selectedFile)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Time Image
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            上傳照片，自動加上時間碼水印
          </p>
        </header>

        <div className="space-y-6">
          <ImageUploader onImageSelect={handleImageSelect} />

          {loading && (
            <div className="text-center py-4">
              <p className="text-gray-600 dark:text-gray-400">讀取 EXIF 資料中...</p>
            </div>
          )}

          {imageUrl && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <ImagePreview
                  imageUrl={imageUrl}
                  timestamp={timestamp}
                  config={config}
                />
              </div>
              <div>
                <TimestampEditor config={config} onChange={setConfig} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
