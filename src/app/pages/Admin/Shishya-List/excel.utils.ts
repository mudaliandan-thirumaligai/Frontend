import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export async function exportToExcel(
  data: any[],
  fileName: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');

  if (!data || data.length === 0) {
    return;
  }

  // Create columns dynamically from object keys
  worksheet.columns = Object.keys(data[0]).map((key) => ({
    header: key,
    key: key,
    width: 20,
  }));

  // Add rows
  data.forEach((item) => {
    worksheet.addRow(item);
  });

  // Optional: make header bold
  worksheet.getRow(1).font = { bold: true };

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, `${fileName}.xlsx`);
}
