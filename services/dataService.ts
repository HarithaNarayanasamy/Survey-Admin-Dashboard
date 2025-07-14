
import { User } from '../types';

const escapeCsvField = (field: any): string => {
  if (field === null || field === undefined) {
    return '';
  }
  const stringField = String(field);
  // If the field contains a comma, a quote, or a newline, wrap it in double quotes.
  if (stringField.search(/("|,|\n)/g) >= 0) {
    // Within a quoted field, any double quote must be escaped by another double quote.
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

export const exportToCsv = (data: User[], filename: string = 'updated_users.csv'): void => {
  if (data.length === 0) {
    alert('No data to export.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), 
    ...data.map(row => 
      headers.map(fieldName => 
        escapeCsvField(row[fieldName as keyof User])
      ).join(',')
    )
  ];

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
