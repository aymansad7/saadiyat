import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { externalDeveloperProjects, externalDeveloperUnits } from "../../drizzle/schema";
import { getDb } from "../db";
import { masterProcedure, router } from "../_core/trpc";

export const EMIRATES_PROJECTS = [
  { slug: "emirates-jumeirah-al-maryah", displayName: "Jumeirah", locationLabel: "Al Maryah Island", sourceProjectName: "Al Maryah Tower" },
  { slug: "emirates-elie-saab-yas", displayName: "Elie Saab", locationLabel: "Yas Island", sourceProjectName: "Stellar By Elie Saab" },
  { slug: "emirates-hilton-yas", displayName: "Hilton", locationLabel: "Yas Island", sourceProjectName: "Hilton Al Raha" },
] as const;

export function isSourceAvailable(status: string | null | undefined) {
  return String(status ?? "").trim().toLowerCase() === "available";
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "External-project inventory is unavailable" });
  return db;
}

export const externalDevelopersRouter = router({
  list: masterProcedure.query(async () => {
    const db = await requireDb();
    const projects = await db.select().from(externalDeveloperProjects).orderBy(asc(externalDeveloperProjects.displayName));
    return {
      developerName: "Emirates",
      sourceWorkbook: "EmiratesOne_All_Properties.xlsx",
      projects,
    };
  }),

  getProject: masterProcedure
    .input(z.object({ projectSlug: z.string().min(1).max(128) }))
    .query(async ({ input }) => {
      const db = await requireDb();
      const [project] = await db.select().from(externalDeveloperProjects).where(eq(externalDeveloperProjects.projectSlug, input.projectSlug)).limit(1);
      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "External project not found" });
      const units = await db.select().from(externalDeveloperUnits)
        .where(eq(externalDeveloperUnits.projectSlug, input.projectSlug))
        .orderBy(asc(externalDeveloperUnits.unitNumber), asc(externalDeveloperUnits.sourceId));
      return { project, units };
    }),

  getUnit: masterProcedure
    .input(z.object({ projectSlug: z.string().min(1).max(128), sourceId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await requireDb();
      const [unit] = await db.select().from(externalDeveloperUnits)
        .where(and(eq(externalDeveloperUnits.projectSlug, input.projectSlug), eq(externalDeveloperUnits.sourceId, input.sourceId)))
        .limit(1);
      if (!unit) throw new TRPCError({ code: "NOT_FOUND", message: "External source unit not found" });
      const [project] = await db.select().from(externalDeveloperProjects).where(eq(externalDeveloperProjects.projectSlug, input.projectSlug)).limit(1);
      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "External project not found" });
      return { project, unit };
    }),
});
