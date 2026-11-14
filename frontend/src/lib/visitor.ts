const VISITOR_KEY = "visitorId";

export function getVisitorId() {
  let visitorId = localStorage.getItem(VISITOR_KEY);
  if (visitorId === null) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, visitorId);
  }
  return visitorId;
}
