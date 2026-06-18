const SUPERSET_URL = process.env.SUPERSET_URL || "NOT SET";
console.log("SUPERSET_URL env:", SUPERSET_URL);

fetch("http://flowdesk-superset:8088/api/v1/security/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "admin",
    password: "admin",
    provider: "db",
    refresh: true
  })
})
  .then(async r => {
    console.log("STATUS:", r.status);
    const text = await r.text();
    console.log("BODY:", text);
  })
  .catch(e => console.log("LOGIN FAILED:", e.message, e.cause));
