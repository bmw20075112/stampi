export type DateFormat = 'YYYY/MM/DD' | 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';

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

  switch (format) {
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    default:
      return '';
  }
}
