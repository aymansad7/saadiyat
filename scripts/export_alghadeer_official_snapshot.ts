import { exportAlGhadeerOfficialWorkbook } from "../server/alGhadeerOfficialExport";

const workbook = await exportAlGhadeerOfficialWorkbook();
console.log(JSON.stringify({
  filename: workbook.filename,
  rowCount: workbook.rowCount,
  itemId: workbook.itemId,
}, null, 2));
