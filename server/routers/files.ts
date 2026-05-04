import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  deleteFileById,
  getFileById,
  insertVillaFile,
  listFilesForVilla,
  listGlobalFiles,
} from "../db";
import { storagePut } from "../storage";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/zip",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
];

const villaKeyRegex = /^[a-z0-9][a-z0-9-_/]{0,127}$/;

const uploadInput = z.object({
  scope: z.enum(["villa", "global"]),
  villaKey: z.string().regex(villaKeyRegex).optional(),
  category: z.string().max(64).optional(),
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(128),
  description: z.string().max(2000).optional(),
  /** base64-encoded file body */
  dataB64: z.string().min(1),
});

export const filesRouter = router({
  /** Public: list per-villa attachments */
  listByVilla: publicProcedure
    .input(z.object({ villaKey: z.string().regex(villaKeyRegex) }))
    .query(({ input }) => listFilesForVilla(input.villaKey)),

  /** Public: list global Documents library */
  listGlobal: publicProcedure.query(() => listGlobalFiles()),

  /** Authenticated: upload a file (per-villa or global) */
  upload: protectedProcedure
    .input(uploadInput)
    .mutation(async ({ ctx, input }) => {
      // Validate scope vs villaKey consistency
      if (input.scope === "villa" && !input.villaKey) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "villaKey is required when scope=villa",
        });
      }
      if (input.scope === "global" && input.villaKey) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "villaKey must be omitted when scope=global",
        });
      }

      // Validate mime
      if (!ALLOWED_MIME.includes(input.mimeType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Unsupported file type: ${input.mimeType}`,
        });
      }

      // Decode base64 and validate size
      let buf: Buffer;
      try {
        buf = Buffer.from(input.dataB64, "base64");
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid base64 data" });
      }

      if (buf.byteLength === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Empty file" });
      }
      if (buf.byteLength > MAX_BYTES) {
        throw new TRPCError({
          code: "PAYLOAD_TOO_LARGE",
          message: `File exceeds ${MAX_BYTES / 1024 / 1024} MB limit`,
        });
      }

      // Build a clean storage key path
      const safeName = input.filename
        .replace(/[^A-Za-z0-9._-]+/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 120);

      const folder =
        input.scope === "villa"
          ? `villa-files/${input.villaKey}`
          : `global-files`;
      const relKey = `${folder}/${safeName}`;

      // Upload to S3 via Forge presigned URL
      const { key } = await storagePut(relKey, buf, input.mimeType);

      // Persist metadata
      const inserted = await insertVillaFile({
        scope: input.scope,
        villaKey: input.scope === "villa" ? input.villaKey! : null,
        category: input.category ?? null,
        filename: input.filename.slice(0, 255),
        mimeType: input.mimeType,
        sizeBytes: buf.byteLength,
        storageKey: key,
        description: input.description ?? null,
        uploadedBy: ctx.user.id,
        uploaderName: ctx.user.name ?? ctx.user.email ?? null,
      });

      return inserted!;
    }),

  /** Admin: delete a file */
  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const file = await getFileById(input.id);
      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }
      await deleteFileById(input.id);
      return { ok: true as const, id: input.id };
    }),
});
