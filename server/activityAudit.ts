import { activityAudit } from "../drizzle/schema";
import { getDb } from "./db";

export type ActivityEventInput = {
  eventType:
    | "sign_in"
    | "property_edit"
    | "access_grant_create"
    | "access_grant_update"
    | "access_grant_delete"
    | "access_role_update"
    | "document_create"
    | "document_update"
    | "document_remove"
    | "onedrive_sync"
    | "owner_create"
    | "owner_update"
    | "owner_unit_link";
  actorEmail: string;
  actorName?: string | null;
  targetEmail?: string | null;
  entityType?: string | null;
  entityKey?: string | null;
  summary: string;
  changes?: unknown;
  ip?: string | null;
  userAgent?: string | null;
};

/** Records an append-only activity event without making the caller fail if audit storage is unavailable. */
export async function appendActivityAudit(event: ActivityEventInput) {
  const db = await getDb();
  if (!db) return;
  try {
    const changesJson = event.changes === undefined ? null : JSON.stringify(event.changes).slice(0, 8_000);
    await db.insert(activityAudit).values({
      eventType: event.eventType,
      actorEmail: event.actorEmail,
      actorName: event.actorName ?? null,
      targetEmail: event.targetEmail ?? null,
      entityType: event.entityType ?? null,
      entityKey: event.entityKey ?? null,
      summary: event.summary,
      changesJson,
      ip: event.ip ?? null,
      userAgent: event.userAgent ?? null,
    });
  } catch (error) {
    console.error("[Activity audit] Unable to save event", error);
  }
}
