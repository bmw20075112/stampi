import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DragEvent, ChangeEvent } from 'react';

interface ImageUploaderProps {
	onImageSelect: (file: File) => void;
}

export default function ImageUploader({ onImageSelect }: ImageUploaderProps) {
	const { t } = useTranslation();
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			onImageSelect(file);
		}
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);

		const file = e.dataTransfer.files[0];
		if (file && file.type.startsWith('image/')) {
			onImageSelect(file);
		}
	};

	return (
		<div
			data-testid="upload-area"
			onClick={handleClick}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			className={`
        flex flex-col items-center justify-center
        w-full h-48 sm:h-64 border-2 border-dashed rounded-xl
        cursor-pointer transition-all duration-200
        ${
					isDragging
						? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
						: 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
				}
      `}
		>
			<svg
				className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500 mb-3"
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
			<p className="text-gray-600 dark:text-gray-300 mb-1 font-medium">
				{t('uploader.title')}
			</p>
			<p className="text-sm text-gray-400 dark:text-gray-500">
				{t('uploader.dragText')}
			</p>
			<p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
				{t('uploader.supportedFormats')}
			</p>
			<input
				ref={fileInputRef}
				data-testid="file-input"
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				className="hidden"
			/>
		</div>
	);
}
