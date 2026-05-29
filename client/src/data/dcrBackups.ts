/**
 * Pre-built DCR backup ZIP archives (uploaded to project storage May 29, 2026).
 *
 * These are static, ready-to-serve ZIPs of every DCR PDF for each community:
 *
 * | Community | Files | ZIP size |
 * |-----------|------:|---------:|
 * | Jawaher   |    83 |   224 MB |
 * | SBV       |   441 |   2.1 GB |
 * | St. Regis |    33 |   112 MB |
 *
 * The on-the-fly `/api/dcr-zip?prefix=…` endpoint still works for arbitrary
 * sub-groups (e.g. SBV Gate 2 only). These constants exist so the user can
 * grab the *full* community pack instantly without server build time.
 */
export interface DcrBackup {
  /** Public storage URL — always available, no auth required. */
  url: string;
  /** Suggested filename (the storage URL has a hash suffix). */
  filename: string;
  /** Total PDFs inside. */
  count: number;
  /** Approximate uncompressed size, in bytes. */
  sizeBytes: number;
}

export const DCR_BACKUPS = {
  jawaher: {
    url: "/manus-storage/Jawaher_Backup_790b7151.zip",
    filename: "Jawaher_Backup.zip",
    count: 83,
    sizeBytes: 234_028_651,
  },
  sbv: {
    url: "/manus-storage/SBV_Backup_f64e93d2.zip",
    filename: "SBV_Backup.zip",
    count: 441,
    sizeBytes: 2_177_356_386,
  },
  stRegis: {
    url: "/manus-storage/StRegis_Backup_6990afd3.zip",
    filename: "StRegis_Backup.zip",
    count: 33,
    sizeBytes: 117_028_456,
  },
} as const satisfies Record<string, DcrBackup>;

export type DcrBackupKey = keyof typeof DCR_BACKUPS;
