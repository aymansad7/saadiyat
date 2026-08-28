import { protectedProcedure, router } from "../_core/trpc";
import { getHiddSensitiveFacts } from "../hiddListingData";

/** Protected supplemental Hidd facts. Public property facts are served from a
 * separate contact-free client dataset, so sensitive source data is never
 * bundled into an unauthorised browser. */
export const hiddRouter = router({
  sensitiveFacts: protectedProcedure.query(async ({ ctx }) => getHiddSensitiveFacts(ctx.user)),
});
