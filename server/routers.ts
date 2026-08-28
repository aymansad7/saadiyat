import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { aldarOtherRouter } from "./routers/aldarOther";
import { aldarSaadiyatRouter } from "./routers/aldarSaadiyat";
import { lagoonsRouter } from "./routers/lagoons";
import { availabilityRouter } from "./routers/availability";
import { filesRouter } from "./routers/files";
import { gateRouter } from "./routers/gate";
import { hiddRouter } from "./routers/hidd";
import { inventoryHistoryRouter } from "./routers/inventoryHistory";
import { magicRouter } from "./routers/magic";
import { publicResaleRouter } from "./routers/publicResale";
import { propertyAccessRouter } from "./routers/propertyAccess";
import { resaleRouter } from "./routers/resale";
import { unitSearchRouter } from "./routers/unitSearch";
import { villaListingsRouter } from "./routers/villaListings";
import { MAGIC_SESSION_COOKIE, revokeSessionToken } from "./magicAuth";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      // Clear both auth surfaces (OAuth + magic-link) so logout is fully effective.
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      const magicToken = (() => {
        const header = ctx.req.headers.cookie ?? "";
        for (const part of header.split(";")) {
          const [k, v] = part.trim().split("=");
          if (k === MAGIC_SESSION_COOKIE && v) return decodeURIComponent(v);
        }
        return null;
      })();
      if (magicToken) await revokeSessionToken(magicToken);
      ctx.res.clearCookie(MAGIC_SESSION_COOKIE, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  magic: magicRouter,
  villaListings: villaListingsRouter,
  propertyAccess: propertyAccessRouter,
  files: filesRouter,
  gate: gateRouter,
  hidd: hiddRouter,
  aldarOther: aldarOtherRouter,
  aldarSaadiyat: aldarSaadiyatRouter,
  lagoons: lagoonsRouter,
  resale: resaleRouter,
  publicResale: publicResaleRouter,
  availability: availabilityRouter,
  inventoryHistory: inventoryHistoryRouter,
  unitSearch: unitSearchRouter,
});

export type AppRouter = typeof appRouter;
