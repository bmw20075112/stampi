import type { TimestampConfig, Position } from '../utils/imageProcessor'
import type { DateFormat } from '../utils/dateFormatter'

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
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">時間碼設定</h3>

      <div>
        <label htmlFor="format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          格式
        </label>
        <select
          id="format"
          value={config.format}
          onChange={handleFormatChange}
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          {formatOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          位置
        </label>
        <select
          id="position"
          value={config.position}
          onChange={handlePositionChange}
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          {positionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          字體大小
        </label>
        <div className="flex items-center gap-3">
          <input
            id="fontSize"
            type="range"
            min="12"
            max="150"
            value={config.fontSize}
            onChange={handleFontSizeChange}
            className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-sm font-mono text-gray-600 dark:text-gray-400 w-14 text-right">
            {config.fontSize}px
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          顏色
        </label>
        <div className="flex items-center gap-3">
          <input
            id="color"
            type="color"
            value={config.color}
            onChange={handleColorChange}
            className="w-12 h-10 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600"
          />
          <span className="text-sm font-mono text-gray-600 dark:text-gray-400 uppercase">
            {config.color}
          </span>
        </div>
      </div>
    </div>
  )
}
