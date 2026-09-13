import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { registeredSaleTransactions } from "../../drizzle/schema";
import { getDb } from "../db";
import { masterProcedure, router } from "../_core/trpc";

/** Reviewed transaction evidence remains separate from Aldar's official live price. */
export const registeredSalesRouter = router({
  byUnit: masterProcedure
    .input(z.object({ unitName: z.string().min(1).max(191) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        saleApplicationDate: registeredSaleTransactions.saleApplicationDate,
        registeredSellingPriceAed: registeredSaleTransactions.registeredSellingPriceAed,
        registeredRateAedSqm: registeredSaleTransactions.registeredRateAedSqm,
        saleableAreaSqm: registeredSaleTransactions.saleableAreaSqm,
        saleApplicationType: registeredSaleTransactions.saleApplicationType,
        saleSequence: registeredSaleTransactions.saleSequence,
        matchEvidence: registeredSaleTransactions.matchEvidence,
        sourceFile: registeredSaleTransactions.sourceFile,
      }).from(registeredSaleTransactions).where(and(
        eq(registeredSaleTransactions.dataset, "saadiyat"),
        eq(registeredSaleTransactions.projectSlug, "nobu-residences"),
        eq(registeredSaleTransactions.matchType, "unit_exact"),
        eq(registeredSaleTransactions.matchedUnitName, input.unitName),
      )).orderBy(desc(registeredSaleTransactions.saleApplicationDate));
    }),
});
