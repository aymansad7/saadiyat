export type ProjectViewMode = "cards" | "table";

export function getProjectViewMode(search: string): ProjectViewMode {
  return new URLSearchParams(search).get("view") === "table" ? "table" : "cards";
}

export function getInitialProjectViewMode(): ProjectViewMode {
  return getProjectViewMode(typeof window === "undefined" ? "" : window.location.search);
}
