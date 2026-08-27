import type { Request, Response } from "express";

const ALDAR_HOST = "world.aldar.com";
const TIMEOUT_MS = 12_000;

const CURRENT_UNIT_QUERY = "unitstate=floorplan&scheme=S1&furnished=true";
/**
 * Aldar URLs which were opened and verified in a browser by the user but can
 * return an inaccurate status to a server-side, unauthenticated fetch. The
 * target is still calculated from a strict project + unit-code rule below;
 * this set only bypasses the unreliable preflight for that documented case.
 */
const BROWSER_VERIFIED_CURRENT_UNIT_KEYS = new Set([
  "the-sustainable-city-yas-island:sc-yn7-th-362",
]);
const WITHDRAWN_CURRENT_UNIT_KEYS = new Set([
  "the-row-saadiyat:therowsaadiyat-b1-01-15",
  "the-row-saadiyat:therowsaadiyat-b2-01-05",
  "the-row-saadiyat:therowsaadiyat-b5-01-04",
  "the-row-saadiyat:therowsaadiyat-b6-01-03",
  "the-row-saadiyat:therowsaadiyat-b7-01-11",
  "almarjan:almarjan-b2-16-09",
  "the-canopies:thecanopies-b1-02-04",
  "the-canopies:thecanopies-b3-02-08",
  "the-canopies:thecanopies-b6-02-08",
  "fahidbeachresidences:fahidbeachresidences-b5-01-04",
  "louvreresidences:grove-r16-05-09",
]);

/**
 * Current URLs verified against a live World of Aldar response on 27 Aug 2026.
 * A rule is deliberately scoped by both the internal project slug and the
 * documented unit-code pattern, so a code from another project cannot acquire
 * an arbitrary Aldar URL.
 */
function currentAldarUnitUrl(projectSlug: string | null | undefined, unitName: string) {
  const project = (projectSlug || "").trim().toLowerCase();
  const unit = unitName.trim();
  if (WITHDRAWN_CURRENT_UNIT_KEYS.has(`${project}:${unit.toLowerCase()}`)) return null;
  let path: string | null = null;
  let code: string | null = null;

  const prefixed = (prefix: RegExp, projectPath: string) => {
    const match = prefix.exec(unit);
    if (!match) return null;
    return { projectPath, code: match[1] };
  };

  const result =
    project === "gardenia-bay"
      ? (() => {
          const match = /^gardenia-([^-]+)-b\d+-(.+)$/i.exec(unit);
          return match ? { projectPath: "gardenia", code: `${match[1]}-${match[2]}` } : null;
        })()
      : project === "al-deem-townhomes"
        ? (() => {
            const match = /^aldeemtownhomes-aldeem-th-(\d+)$/i.exec(unit);
            return match ? { projectPath: "aldeemtownhomes", code: `AlDeem-${match[1]}-01` } : null;
          })()
      : project === "almarjan"
      ? prefixed(/^almarjan-(.+)$/i, "almarjan")
      : project === "rosso-bay-residences"
        ? prefixed(/^almarjan-(.+)$/i, "almarjan")
        : project === "al-ghadeer-gardens"
          ? (() => {
              const match = /^alghadeergardens-(r\d+-(?:v|th)-\d+)$/i.exec(unit);
              return match ? { projectPath: "alghadeergardens", code: `${match[1]}-01` } : null;
            })()
        : project === "nobu-residences"
          ? (() => {
              const match = /^noburesidences-b2-east-(\d{2}-\d{2})$/i.exec(unit);
              return match ? { projectPath: "noburesidences", code: `B2E-${match[1]}`, query: "scheme=S1&unitstate=interior&furnished=true" } : null;
            })()
        : project === "athlon"
          ? (() => {
              const match = /^athlon-(.+?)-(?:th|v)-(.+)$/i.exec(unit);
              return match ? { projectPath: "athlon", code: `${match[1]}-${match[2]}` } : null;
            })()
          : project === "fahidbeachresidences"
            ? prefixed(/^fahidbeachresidences-(.+)$/i, "fahidbeachresidences")
            : project === "fahidbeachterraces"
              ? prefixed(/^fahidbeachterraces-(.+)$/i, "fahidbeachterraces")
              : project === "fountainviewresidences"
                ? prefixed(/^fountainviewresidences-(.+)$/i, "fountainviewresidences")
                : project === "onesaadiyat"
                  ? prefixed(/^onesaadiyat-(.+)$/i, "onesaadiyat")
                  : project === "the-canopies"
                    ? prefixed(/^thecanopies-(.+)$/i, "thecanopies")
                    : project === "thearthouse"
                      ? prefixed(/^thearthouse-(.+)$/i, "thearthouse")
                      : project === "thebeachhouse"
                        ? prefixed(/^thebeachhouse-(.+)$/i, "thebeachhouse")
                        : project === "verdes"
                          ? prefixed(/^verdes-(.+)$/i, "verdes")
                          : project === "wilds"
                            ? (() => {
                                const match = /^thewilds-(.+)-v-(.+)$/i.exec(unit);
                                return match ? { projectPath: "wilds", code: `${match[1]}-${match[2]}`, cityPath: "dubai" } : null;
                              })()
      : ["rise-by-athlon-1", "rise-by-athlon-2", "rise-by-athlon-3", "rise-by-athlon-4"].includes(project)
        ? prefixed(/^risebyathlon-(.+)$/i, "risebyathlon")
        : project === "the-sustainable-city-yas-island"
          ? (() => {
              const match = /^sc-yn7-th-(\d+)$/i.exec(unit);
              return match ? { projectPath: "sc", code: `YN7-${match[1]}-01` } : null;
            })()
        : project === "sama-yas"
          ? prefixed(/^samayas-(.+)$/i, "samayas")
          : project === "yas-links-luxury-living"
            ? prefixed(/^yaslinksluxury-(.+)$/i, "yaslinksluxury")
            : project === "yas-park-place"
              ? prefixed(/^yasparkplace-(.+)$/i, "yasparkplace")
              : project === "faya-al-saadiyat"
                ? prefixed(/^(fayaalsaadiyat-.+)$/i, "fayaalsaadiyat")
                : project === "faya-al-saadiyat-ii"
                  ? (() => {
                      const match = /^fayaalsaadiyatii-(.+?)-v-(.+)$/i.exec(unit);
                      return match ? { projectPath: "fayaalsaadiyatii", code: `${match[1]}-${match[2]}` } : null;
                    })()
                  : project === "mamsha-gardens"
                    ? prefixed(/^mamshagarden-(.+)$/i, "mamshagarden")
                    : project === "mamsha-palm"
                      ? prefixed(/^mamshapalm-(.+)$/i, "mamshapalm")
                      : project === "the-row-saadiyat"
                        ? prefixed(/^therowsaadiyat-(.+)$/i, "therowsaadiyat")
                          : project === "the-source-terraces"
                            ? prefixed(/^thesourceterraces-(r\d+-\d+-\d+)$/i, "thesourceterraces")
                            : null;
  if (!result) return null;
  path = result.projectPath;
  code = result.code;
  const city = "cityPath" in result ? result.cityPath : "abudhabi";
  const query = "query" in result ? result.query : CURRENT_UNIT_QUERY;
  return `https://world.aldar.com/uae/${city}/${path}/property/${encodeURIComponent(code)}/0?${query}`;
}

function isLegacyExactAldarUnitUrl(rawUrl: string, unitName: string) {
  try {
    const url = new URL(rawUrl);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const propertyCode = decodeURIComponent(pathParts.at(-1) ?? "");
    return url.protocol === "https:" && url.hostname === ALDAR_HOST && pathParts.at(-2) === "property" && propertyCode.toLowerCase() === unitName.toLowerCase();
  } catch {
    return false;
  }
}

function isCurrentVerifiedAldarUnitUrl(rawUrl: string, unitName: string, projectSlug?: string | null) {
  const current = currentAldarUnitUrl(projectSlug, unitName);
  if (!current) return false;
  try {
    return new URL(rawUrl).toString() === new URL(current).toString();
  } catch {
    return false;
  }
}

/**
 * Accept only the captured World of Aldar property URL whose terminal property
 * code is exactly the supplied unit name, or a documented current project
 * format whose project/unit code pair was independently verified.
 */
export function getExactOfficialAldarUnitUrl(
  rawUrl: string | null | undefined,
  unitName: string | null | undefined,
  projectSlug?: string | null,
) {
  if (!unitName) return null;
  const current = currentAldarUnitUrl(projectSlug, unitName);
  if (current) {
    if (!rawUrl || isCurrentVerifiedAldarUnitUrl(rawUrl, unitName, projectSlug) || isLegacyExactAldarUnitUrl(rawUrl, unitName)) {
      return current;
    }
    return null;
  }
  if (!rawUrl || !isLegacyExactAldarUnitUrl(rawUrl, unitName)) return null;
  return new URL(rawUrl).toString();
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
  const projectSlug = typeof req.query.project === "string" ? req.query.project : null;
  const target = getExactOfficialAldarUnitUrl(rawUrl, unitName, projectSlug);
  if (!target) {
    return res.status(404).type("html").send(unavailableHtml(
      "Official unit link unavailable",
      "This unit does not currently have a verified official Aldar URL format that matches its recorded project and unit code. No replacement link has been guessed.",
    ));
  }

  const browserVerifiedKey = `${(projectSlug ?? "").trim().toLowerCase()}:${(unitName ?? "").trim().toLowerCase()}`;
  if (BROWSER_VERIFIED_CURRENT_UNIT_KEYS.has(browserVerifiedKey)) {
    return res.redirect(302, target);
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
