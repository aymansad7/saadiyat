import type { Request, Response } from "express";

const ALDAR_HOST = "world.aldar.com";
const TIMEOUT_MS = 12_000;

/**
 * Accept only the captured World of Aldar property URL whose terminal property
 * code is exactly the supplied unit name. This deliberately does not infer a
 * URL for a record that did not carry one in its source export.
 */
export function getExactOfficialAldarUnitUrl(rawUrl: string | null | undefined, unitName: string | null | undefined) {
  if (!rawUrl || !unitName) return null;
  try {
    const url = new URL(rawUrl);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const propertyCode = decodeURIComponent(pathParts.at(-1) ?? "");
    const isPropertyPath = pathParts.at(-2) === "property";
    if (url.protocol !== "https:" || url.hostname !== ALDAR_HOST || !isPropertyPath || propertyCode !== unitName) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function unavailableHtml(title: string, detail: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>body{margin:0;background:#fbfaf7;color:#1d2823;font-family:Arial,sans-serif}.wrap{max-width:620px;margin:10vh auto;padding:32px}.eyebrow{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#98703d}h1{font-family:Georgia,serif;font-size:34px;font-weight:400;line-height:1.15;margin:12px 0}p{color:#58615c;line-height:1.6}a{display:inline-block;margin-top:12px;color:#896225;text-decoration:underline}</style></head><body><main class="wrap"><div class="eyebrow">Saadiyat Resale Hub · Aldar source</div><h1>${title}</h1><p>${detail}</p><a href="javascript:window.close()">Close this tab</a></main></body></html>`;
}

/**
 * Validates an exact source-backed unit URL, then checks it before redirecting.
 * A withdrawn World of Aldar page stays a documented source record but no
 * longer sends a client directly to Aldar's generic 404 screen.
 */
export async function aldarOfficialLinkHandler(req: Request, res: Response) {
  const rawUrl = typeof req.query.url === "string" ? req.query.url : null;
  const unitName = typeof req.query.unit === "string" ? req.query.unit : null;
  const target = getExactOfficialAldarUnitUrl(rawUrl, unitName);
  if (!target) {
    return res.status(404).type("html").send(unavailableHtml(
      "Official unit link unavailable",
      "This unit does not currently have a source-backed Aldar URL that exactly matches its recorded unit code. No replacement link has been guessed.",
    ));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(target, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: { accept: "text/html,application/xhtml+xml" },
    });
    await response.body?.cancel().catch(() => undefined);
    if (response.status >= 200 && response.status < 400) {
      return res.redirect(302, target);
    }
    const withdrawn = response.status === 404 || response.status === 410;
    return res.status(withdrawn ? 410 : 502).type("html").send(unavailableHtml(
      withdrawn ? "Aldar no longer publishes this unit page" : "Official Aldar page could not be verified",
      withdrawn
        ? "The exact official unit URL stored with this record now responds as unavailable at Aldar. The internal Saadiyat card remains available; no alternative unit URL has been substituted."
        : "The exact official unit URL could not be verified right now. Please try again later; no replacement URL has been guessed.",
    ));
  } catch {
    return res.status(502).type("html").send(unavailableHtml(
      "Official Aldar page could not be verified",
      "The exact official unit URL could not be verified right now. Please try again later; no replacement URL has been guessed.",
    ));
  } finally {
    clearTimeout(timeout);
  }
}
