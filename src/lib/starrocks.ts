import mysql from "mysql2/promise";

let connection: mysql.Connection | null = null;

export async function connectStarRocks() {
  if (connection) return connection;

  connection = await mysql.createConnection({
    host:     "127.0.0.1",
    port:     9030,
    user:     "root",
    password: "",
    database: "flowdesk",
  });

  return connection;
}

export async function queryStarRocks(sql: string): Promise<{
  rows: any[];
  timeMs: number;
}> {
  const conn  = await connectStarRocks();
  const start = Date.now();
  const [rows] = await conn.execute(sql);
  const timeMs = Date.now() - start;
  return { rows: rows as any[], timeMs };
}