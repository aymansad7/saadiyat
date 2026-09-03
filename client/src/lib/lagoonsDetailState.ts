export function getLagoonsDetailState(isLoading: boolean, hasVilla: boolean) {
  if (isLoading) return "loading" as const;
  return hasVilla ? "ready" as const : "not-found" as const;
}
