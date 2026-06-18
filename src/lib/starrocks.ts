import mysql from "mysql2/promise";

// ✅ Use a pool instead of a single connection (more stable)
const pool = mysql.createPool({
  host:     process.env.STARROCKS_HOST     || "localhost",
  port:     Number(process.env.STARROCKS_PORT) || 9030,
  user:     process.env.STARROCKS_USERNAME || "root",
  password: process.env.STARROCKS_PASSWORD || "",
  database: process.env.STARROCKS_DATABASE || "flowdesk",

  // ✅ Critical — disables prepared statement protocol
  namedPlaceholders: false,

  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

export async function queryStarRocks(sql: string, params: any[] = []): Promise<{
  rows:   any[];
  timeMs: number;
}> {
  const start = Date.now();

  // ✅ Use pool.query() NOT pool.execute()
  // execute() uses prepared statements → breaks in StarRocks
  // query()   uses text protocol       → works fine
  const [rows] = await pool.query(sql, params);

  const timeMs = Date.now() - start;
  return { rows: rows as any[], timeMs };
}

// Optional: export pool if you ever need raw access
export { pool };