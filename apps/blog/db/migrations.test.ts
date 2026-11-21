import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { expect, test } from "vite-plus/test";

test("production migrations initialize the schema without demo users or posts", () => {
  const database = new DatabaseSync(":memory:");
  try {
    const migrations = readMigrationFiles({
      migrationsFolder: fileURLToPath(new URL("./migrations/", import.meta.url)),
    });
    for (const migration of migrations) {
      for (const statement of migration.sql) {
        database.exec(statement);
      }
    }

    for (const table of ["user", "account", "Post"]) {
      expect(database.prepare(`SELECT count(*) AS count FROM "${table}"`).get()).toEqual({
        count: 0,
      });
    }
  } finally {
    database.close();
  }
});
