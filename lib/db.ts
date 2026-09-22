import { neon } from '@neondatabase/serverless';

/**
 * Server-only Neon Postgres client (the HTTP driver — no persistent
 * connection, so it's a good fit for Server Actions running as serverless
 * functions). Only call this from Server Actions / Route Handlers — never
 * import it into a Client Component or otherwise let the connection string
 * reach the browser.
 *
 * Returns `null` when `DATABASE_URL` isn't configured yet, so callers can
 * fail soft instead of throwing.
 */
export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  return neon(connectionString);
}
