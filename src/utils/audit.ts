import { supabase } from "@/integrations/supabase/client";

/**
 * Log an audit event into the `audit_logs` table.
 * The function will attempt to determine the current user via the Supabase client.
 *
 * @param action - short string describing the action (e.g. 'service_created')
 * @param details - optional object with contextual details
 */
export async function auditLog(action: string, details?: any) {
  try {
    // Try to get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id ?? null;

    await supabase.from("audit_logs").insert({
      user_id: userId,
      action,
      details: details ? details : null,
    });
  } catch (error) {
    // We intentionally swallow errors here to avoid breaking the main flow.
    // Logging to console helps diagnostics during development.
    // eslint-disable-next-line no-console
    console.error("auditLog error:", error);
  }
}