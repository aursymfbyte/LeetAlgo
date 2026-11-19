import { readStoredValue, writeStoredValue } from "./storage";

const VISITOR_KEY = "visitorId";

export function getVisitorId() {
  const visitorId = readStoredValue(VISITOR_KEY);
  if (visitorId !== null) return visitorId;
  if (typeof crypto.randomUUID !== "function") return null;

  const newId = crypto.randomUUID();
  return writeStoredValue(VISITOR_KEY, newId) ? newId : null;
}
