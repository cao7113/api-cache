import { db } from "./sqlite-setup";
import { remoteResponsesTable as rt } from "./schema";

// Try drizzle ORM

// https://orm.drizzle.team/docs/goodies#printing-sql-query
const sqlQuery = db
  ?.select({ id: rt.id, name: rt.pathKey })
  .from(rt)
  .groupBy(rt.id)
  .toSQL();
console.log(sqlQuery);
