/**
 * SQLite type helpers — workaround for expo-sqlite legacy API type limitations.
 * The expo-sqlite legacy API returns union types (ResultSet | ResultSetError)
 * that are cumbersome to work with. These helpers simplify access.
 */

/** Type-safe accessor for query results */
export function getRows<T = any>(result: any): T[] {
  return (result?.rows as T[]) || [];
}

/** Type-safe accessor for single query result */
export function getRow<T = any>(result: any): T | null {
  const rows = getRows<T>(result);
  return rows.length > 0 ? rows[0] : null;
}

/** Type-safe accessor for insert result */
export function getInsertId(result: any): number {
  return result?.insertId || 0;
}
