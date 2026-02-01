export type DateFormat =
	| 'YYYY/MM/DD'
	| 'YYYY-MM-DD'
	| 'DD/MM/YYYY'
	| 'MM/DD/YYYY'
	| 'YYYY/MM/DD HH:mm:ss'
	| 'YYYY-MM-DD HH:mm:ss'
	| 'DD/MM/YYYY HH:mm:ss'
	| 'MM/DD/YYYY HH:mm:ss';

function pad(num: number): string {
	return num.toString().padStart(2, '0');
}

export function formatDate(date: Date, format: DateFormat): string {
	if (!date || isNaN(date.getTime())) {
		return '';
	}

	const year = date.getFullYear();
	const month = pad(date.getMonth() + 1);
	const day = pad(date.getDate());
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());
	const seconds = pad(date.getSeconds());

	switch (format) {
		case 'YYYY/MM/DD':
			return `${year}/${month}/${day}`;
		case 'YYYY-MM-DD':
			return `${year}-${month}-${day}`;
		case 'DD/MM/YYYY':
			return `${day}/${month}/${year}`;
		case 'MM/DD/YYYY':
			return `${month}/${day}/${year}`;
		case 'YYYY/MM/DD HH:mm:ss':
			return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
		case 'YYYY-MM-DD HH:mm:ss':
			return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
		case 'DD/MM/YYYY HH:mm:ss':
			return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
		case 'MM/DD/YYYY HH:mm:ss':
			return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
		default:
			return '';
	}
}
