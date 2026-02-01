import { useTranslation } from 'react-i18next';
import type { TimestampConfig, Position } from '../utils/imageProcessor';
import type { DateFormat } from '../utils/dateFormatter';

interface TimestampEditorProps {
	config: TimestampConfig;
	onChange: (config: TimestampConfig) => void;
}

export default function TimestampEditor({
	config,
	onChange,
}: TimestampEditorProps) {
	const { t } = useTranslation();

	const formatOptions: { value: DateFormat; label: string }[] = [
		{ value: 'YYYY/MM/DD HH:mm:ss', label: t('formats.slashFormatWithTime') },
		{ value: 'YYYY-MM-DD HH:mm:ss', label: t('formats.dashFormatWithTime') },
		{
			value: 'DD/MM/YYYY HH:mm:ss',
			label: t('formats.ddSlashMmSlashYyyyWithTime'),
		},
		{
			value: 'MM/DD/YYYY HH:mm:ss',
			label: t('formats.mmSlashDdSlashYyyyWithTime'),
		},
		{ value: 'YYYY/MM/DD', label: t('formats.slashFormat') },
		{ value: 'YYYY-MM-DD', label: t('formats.dashFormat') },
		{ value: 'DD/MM/YYYY', label: t('formats.ddSlashMmSlashYyyy') },
		{ value: 'MM/DD/YYYY', label: t('formats.mmSlashDdSlashYyyy') },
	];

	const positionOptions: { value: Position; label: string }[] = [
		{ value: 'bottom-right', label: t('positions.bottomRight') },
		{ value: 'bottom-left', label: t('positions.bottomLeft') },
		{ value: 'top-right', label: t('positions.topRight') },
		{ value: 'top-left', label: t('positions.topLeft') },
	];
	const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		onChange({ ...config, format: e.target.value as DateFormat });
	};

	const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		onChange({ ...config, position: e.target.value as Position });
	};

	const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange({ ...config, fontSize: parseInt(e.target.value, 10) });
	};

	const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange({ ...config, color: e.target.value });
	};

	const handleShadowToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) {
			onChange({
				...config,
				shadowBlur: 8,
				shadowOffsetX: 3,
				shadowOffsetY: 3,
				shadowColor: 'rgba(0, 0, 0, 0.9)',
			});
		} else {
			onChange({
				...config,
				shadowBlur: 0,
				shadowOffsetX: 0,
				shadowOffsetY: 0,
			});
		}
	};

	return (
		<div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
			<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
				{t('editor.title')}
			</h3>

			<div>
				<label
					htmlFor="format"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
				>
					{t('common.format')}
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
				<label
					htmlFor="position"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
				>
					{t('common.position')}
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
				<label
					htmlFor="fontSize"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
				>
					{t('common.fontSize')}
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
				<label
					htmlFor="color"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
				>
					{t('common.color')}
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

			<div className="flex items-center gap-3">
				<input
					id="shadow"
					type="checkbox"
					checked={(config.shadowBlur ?? 0) > 0}
					onChange={handleShadowToggle}
					className="w-4 h-4 cursor-pointer accent-blue-500"
				/>
				<label
					htmlFor="shadow"
					className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
				>
					{t('editor.textShadow')}
				</label>
			</div>
		</div>
	);
}
