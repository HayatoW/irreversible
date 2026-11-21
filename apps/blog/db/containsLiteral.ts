import { sql, type SQLWrapper } from "drizzle-orm";

export function containsLiteral(column: SQLWrapper, text: string) {
  const pattern = `%${text.replace(/[!%_]/g, "!$&")}%`;
  return sql`${column} LIKE ${pattern} ESCAPE '!'`;
}
