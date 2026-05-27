import { logAnalyticsEventDB } from "./db";

// Retrieve or generate a persistent session ID
export function getSessionId(): string {
  if (typeof window === "undefined") return "server_session";
  let sessionId = localStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

/**
 * Tracks an analytics event.
 * Safe to call anywhere; fails silently if DB writing fails to prevent breaking UX.
 */
export async function trackEvent(eventType: string, eventData: Record<string, any> = {}): Promise<void> {
  if (typeof window === "undefined") return; // Prevent tracking during SSR
  
  try {
    const sessionId = getSessionId();
    // Fire and forget - don't await in the main thread if possible, 
    // but here we just call the DB function directly.
    logAnalyticsEventDB({
      sessionId,
      eventType,
      eventData,
    }).catch(console.error); // Catch DB errors silently
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}
