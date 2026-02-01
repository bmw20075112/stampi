import { useState, useEffect } from 'react';
import exifr from 'exifr';

interface UseExifDataResult {
	date: Date | null;
	loading: boolean;
	error: string | null;
}

export default function useExifData(file: File | null): UseExifDataResult {
	const [date, setDate] = useState<Date | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!file) {
			setDate(null);
			setLoading(false);
			setError(null);
			return;
		}

		const parseExif = async () => {
			setLoading(true);
			setError(null);

			try {
				const exifData = await exifr.parse(file);

				if (!exifData) {
					setDate(null);
					setLoading(false);
					return;
				}

				const dateValue =
					exifData.DateTimeOriginal ||
					exifData.CreateDate ||
					exifData.ModifyDate ||
					null;

				setDate(dateValue);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error');
				setDate(null);
			} finally {
				setLoading(false);
			}
		};

		parseExif();
	}, [file]);

	return { date, loading, error };
}
