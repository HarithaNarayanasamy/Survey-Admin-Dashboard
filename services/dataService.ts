
import { User } from '../types';
import * as XLSX from 'xlsx';

export const exportToXlsx = (data: User[], filename: string = 'updated_users.xlsx'): void => {
  if (data.length === 0) {
    alert('No data to export.');
    return;
  }

  // Create a new worksheet from the JSON data
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Updated Users');

  // Write the workbook and trigger the download
  XLSX.writeFile(workbook, filename);
};