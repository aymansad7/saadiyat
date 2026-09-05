/**
 * Records the user's explicit confirmation as an operational card sale.
 * It deliberately does not change the developer-source state in inventory_unit_state.
 */
import { appRouter } from "../server/routers";

const caller = appRouter.createCaller({
  user: {
    id: "master-admin-user-confirmed",
    role: "master",
    name: "Master Admin · user-confirmed",
    email: "master-admin-user-confirmed@local",
  },
} as any);

const row = await caller.villaListings.upsert({
  villaKey: "aldar-other/yas-park-place/yasparkplace-b1/YasParkPlace-B1-02-03",
  community: "aldar-other",
  status: "sold",
  saleAgentName: null,
  soldAt: new Date(),
});

console.log(JSON.stringify({
  villaKey: row.villaKey,
  operationalStatus: row.status,
  saleAgentName: row.saleAgentName ?? null,
  soldAt: row.soldAt?.toISOString() ?? null,
}, null, 2));
