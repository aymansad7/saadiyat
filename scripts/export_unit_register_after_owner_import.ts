import { appRouter } from "../server/routers";

const caller = appRouter.createCaller({
  user: {
    id: "source-import",
    email: "source-import@saadiyat-resalehub.local",
    name: "Source Import",
    role: "master",
  },
} as any);

const result = await caller.oneDrive.exportWorkbook();
console.log(JSON.stringify({ exported: true, profileCount: result.profileCount }, null, 2));
