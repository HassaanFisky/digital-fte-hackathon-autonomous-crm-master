import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Panaversity Ecosystem Auth — Shared Router (Companion FTE Node)
 */
export const { GET, POST } = toNextJsHandler(auth);
