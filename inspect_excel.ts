import * as XLSX from 'xlsx';
import * as fs from 'fs';

const filePath = 'sample/sample.xlsx';

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const buffer = fs.readFileSync(filePath);
const workbook = XLSX.read(buffer, { type: 'buffer' });
console.log('Sheet Names:', workbook.SheetNames);

if (workbook.SheetNames.includes('Income')) {
  const sheet = workbook.Sheets['Income'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Get array of arrays
  console.log('Income Sheet Data (First 15 rows):');
  console.log(JSON.stringify(data.slice(0, 15), null, 2));
} else {
  console.log('Income sheet not found.');
}
