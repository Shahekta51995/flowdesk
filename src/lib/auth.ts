// Simple auth helper — reads from cookie
export function getSessionFromCookie(cookieValue: string | undefined) {
  if (!cookieValue) return null;
  try {
    return JSON.parse(cookieValue);
  } catch {
    return null;
  }
}