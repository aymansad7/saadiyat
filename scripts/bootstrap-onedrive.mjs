/**
 * One-time operational bootstrap for the approved OneDrive root.
 * This verifies the existing `Saadiyat Resale Hub` folder and writes the
 * website-owned Unit Register workbook. It never reads Excel back into the
 * database and never accepts an arbitrary OneDrive path.
 */
import { exportUnitRegisterWorkbook, getConfiguredOneDrive } from "../server/oneDrive.ts";

const configured = await getConfiguredOneDrive();
const workbook = await exportUnitRegisterWorkbook();

console.log(JSON.stringify({
  rootFolder: configured.root.name,
  driveType: configured.drive.driveType,
  workbookItemId: workbook.itemId,
  profileCount: workbook.profileCount,
}, null, 2));
