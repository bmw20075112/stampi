import { useTranslation } from 'react-i18next';
import type { DateSource, Confidence } from '../hooks/useTimestamp';

interface DateSourceBadgeProps {
	source: DateSource;
	confidence: Confidence;
	onEdit?: () => void;
}

function getConfidenceColor(confidence: Confidence): {
	bg: string;
	text: string;
	dark: string;
} {
	switch (confidence) {
		case 'high':
			return {
				bg: 'bg-green-100',
				text: 'text-green-700',
				dark: 'dark:bg-green-900/30 dark:text-green-300',
			};
		case 'medium':
			return {
				bg: 'bg-yellow-100',
				text: 'text-yellow-700',
				dark: 'dark:bg-yellow-900/30 dark:text-yellow-300',
			};
		case 'low':
			return {
				bg: 'bg-orange-100',
				text: 'text-orange-700',
				dark: 'dark:bg-orange-900/30 dark:text-orange-300',
			};
		case 'none':
		default:
			return {
				bg: 'bg-gray-100',
				text: 'text-gray-700',
				dark: 'dark:bg-gray-800 dark:text-gray-300',
			};
	}
}

function getSourceIcon(source: DateSource) {
	switch (source) {
		case 'exif-datetime-original':
		case 'exif-create-date':
		case 'exif-modify-date':
			return (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
			);
		case 'filename':
			return (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
			);
		case 'file-modified':
			return (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			);
		case 'user-input':
			return (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
			);
		case 'none':
		default:
			return (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			);
	}
}

function getSourceLabel(
	source: DateSource,
	t: (key: string) => string
): string {
	switch (source) {
		case 'exif-datetime-original':
			return t('dateSource.exifDateTimeOriginal');
		case 'exif-create-date':
			return t('dateSource.exifCreateDate');
		case 'exif-modify-date':
			return t('dateSource.exifModifyDate');
		case 'filename':
			return t('dateSource.filename');
		case 'file-modified':
			return t('dateSource.fileModified');
		case 'user-input':
			return t('dateSource.userInput');
		case 'none':
		default:
			return t('dateSource.none') || 'Unknown';
	}
}

export default function DateSourceBadge({
	source,
	confidence,
	onEdit,
}: DateSourceBadgeProps) {
	const { t } = useTranslation();
	const colors = getConfidenceColor(confidence);
	const icon = getSourceIcon(source);
	const label = getSourceLabel(source, t);

	return (
		<div className="flex items-center gap-2">
			<div
				className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${colors.bg} ${colors.text} ${colors.dark}`}
			>
				{icon}
				<span>{label}</span>
			</div>
			{onEdit && (
				<button
					onClick={onEdit}
					className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
					title="Edit date"
				>
					<svg
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
				</button>
			)}
		</div>
	);
}
