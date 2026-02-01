import type { ProcessedImage } from '../hooks/useBatchProcessing';

interface BatchProgressViewProps {
	images: ProcessedImage[];
	onRemove: (id: string) => void;
}

export default function BatchProgressView({
	images,
	onRemove,
}: BatchProgressViewProps) {
	if (images.length === 0) {
		return (
			<div className="text-center py-8 text-gray-500 dark:text-gray-400">
				<p>No images uploaded yet</p>
			</div>
		);
	}

	const completedCount = images.filter(
		(img) => img.status === 'completed'
	).length;
	const progressPercent = (completedCount / images.length) * 100;

	return (
		<div className="space-y-4">
			{/* Progress summary */}
			<div className="flex items-center justify-between text-sm">
				<span className="text-gray-600 dark:text-gray-300">
					{completedCount} of {images.length} completed
				</span>
				<span className="text-gray-500 dark:text-gray-400">
					{Math.round(progressPercent)}%
				</span>
			</div>

			{/* Progress bar */}
			<div
				role="progressbar"
				aria-valuenow={progressPercent}
				aria-valuemin={0}
				aria-valuemax={100}
				className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
			>
				<div
					className="bg-blue-500 h-full transition-all duration-300"
					style={{ width: `${progressPercent}%` }}
				/>
			</div>

			{/* Image list */}
			<ul className="space-y-2 max-h-96 overflow-y-auto">
				{images.map((image) => (
					<li
						key={image.id}
						className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
					>
						{/* Thumbnail */}
						<img
							src={image.imageUrl}
							alt={image.file.name}
							className="w-16 h-16 object-cover rounded"
						/>

						{/* File info */}
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
								{image.file.name}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{(image.file.size / 1024).toFixed(1)} KB
							</p>
						</div>

						{/* Status badge */}
						<div>
							{image.status === 'pending' && (
								<span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
									Pending
								</span>
							)}
							{image.status === 'processing' && (
								<span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
									Processing
								</span>
							)}
							{image.status === 'completed' && (
								<span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
									Completed
								</span>
							)}
							{image.status === 'error' && (
								<span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
									Error
								</span>
							)}
						</div>

						{/* Remove button */}
						<button
							onClick={() => onRemove(image.id)}
							aria-label={`Remove ${image.file.name}`}
							className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
