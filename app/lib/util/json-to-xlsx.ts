
import * as XLSX from 'xlsx'

interface Props<T> {
  data: T[]
  sheetName: string
  fileName: string
}
export function jsonToXlsx<T>(props: Props<T>) {
  const { data, sheetName, fileName } = props
  // Create Excel workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils?.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  // Save the workbook as an Excel file
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}