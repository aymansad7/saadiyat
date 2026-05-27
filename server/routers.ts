import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { aldarOtherRouter } from "./routers/aldarOther";
import { filesRouter } from "./routers/files";
import { gateRouter } from "./routers/gate";
import { publicResaleRouter } from "./routers/publicResale";
import { resaleRouter } from "./routers/resale";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  files: filesRouter,
  gate: gateRouter,
  aldarOther: aldarOtherRouter,
  resale: resaleRouter,
  publicResale: publicResaleRouter,
});

export type AppRouter = typeof appRouter;
