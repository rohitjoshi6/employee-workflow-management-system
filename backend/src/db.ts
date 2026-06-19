import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgres://workflow:workflow@localhost:5432/workflow_management"
});

export type Queryable = Pick<pg.Pool, "query">;

