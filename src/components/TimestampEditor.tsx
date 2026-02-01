import { TimestampConfig, Position } from '../utils/imageProcessor'
import { DateFormat } from '../utils/dateFormatter'

interface TimestampEditorProps {
  config: TimestampConfig
  onChange: (config: TimestampConfig) => void
}

const formatOptions: { value: DateFormat; label: string }[] = [
  { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
]

const positionOptions: { value: Position; label: string }[] = [
  { value: 'bottom-right', label: '右下' },
  { value: 'bottom-left', label: '左下' },
  { value: 'top-right', label: '右上' },
  { value: 'top-left', label: '左上' },
]

export default function TimestampEditor({ config, onChange }: TimestampEditorProps) {
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...config, format: e.target.value as DateFormat })
  }

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...config, position: e.target.value as Position })
  }

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, fontSize: parseInt(e.target.value, 10) })
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, color: e.target.value })
  }

  return (
    <div className="space-y-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div>
        <label htmlFor="format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          格式
        </label>
        <select
          id="format"
          value={config.format}
          onChange={handleFormatChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          {formatOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          位置
        </label>
        <select
          id="position"
          value={config.position}
          onChange={handlePositionChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          {positionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          字體大小: {config.fontSize}px
        </label>
        <input
          id="fontSize"
          type="range"
          min="12"
          max="150"
          value={config.fontSize}
          onChange={handleFontSizeChange}
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          顏色
        </label>
        <input
          id="color"
          type="color"
          value={config.color}
          onChange={handleColorChange}
          className="w-full h-10 cursor-pointer"
        />
      </div>
    </div>
  )
}
