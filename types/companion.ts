/**
 * Companion System — Type Definitions
 * Shared across CompanionContext, useCompanionSessions, CompanionChat, CompanionSidebar
 */

export interface CompanionMessage {
  role: "user" | "assistant";
  content: string;
  /** ISO 8601 string — NOT locale string, safe for JSON serialisation round-trips */
  timestamp: string;
}

export interface CompanionSession {
  /** Date.now().toString(36) + Math.random().toString(36).slice(2) — collision-proof */
  id: string;
  /** Auto-derived from first user message (≤40 chars + ellipsis). Default: "New Chat" */
  title: string;
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601 — refreshed on every message append
  messages: CompanionMessage[];
  platform: "H0" | "H1" | "H2" | "H3" | "H4";
}

export type CompanionPlatform = CompanionSession["platform"];
