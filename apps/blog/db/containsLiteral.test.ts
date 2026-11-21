import { DatabaseSync } from "node:sqlite";
import { sql } from "drizzle-orm";
import { SQLiteSyncDialect } from "drizzle-orm/sqlite-core";
import { expect, test } from "vite-plus/test";
import { containsLiteral } from "./containsLiteral.ts";

test("matches literal search terms without changing SQLite's case-insensitive LIKE", () => {
  const sqlite = new DatabaseSync(":memory:");
  try {
    sqlite.exec("CREATE TABLE comments (content TEXT NOT NULL)");
    const insert = sqlite.prepare("INSERT INTO comments (content) VALUES (?)");
    for (const content of ["Sale 50%", "sale_code", "Sale code!", "No match"]) {
      insert.run(content);
    }

    const dialect = new SQLiteSyncDialect();
    const search = (query: string) => {
      const where = dialect.sqlToQuery(containsLiteral(sql.identifier("content"), query));
      return sqlite
        .prepare(`SELECT content FROM comments WHERE ${where.sql}`)
        .all(...(where.params as [string]));
    };
    expect(search("%")).toEqual([{ content: "Sale 50%" }]);
    expect(search("_")).toEqual([{ content: "sale_code" }]);
    expect(search("!")).toEqual([{ content: "Sale code!" }]);
    expect(search("sale 50%")).toEqual([{ content: "Sale 50%" }]);
    expect(search("'")).toEqual([]);
  } finally {
    sqlite.close();
  }
});
