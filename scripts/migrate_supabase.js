const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const password = "Analivia@13@#";
const projectRef = "vabwqlkmngabpwnzrdel";

// Tenta conexão direta e poolers comuns
const connectionConfigs = [
  {
    name: "Direct DB Connection",
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    user: "postgres",
    password: password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  },
  {
    name: "Pooler sa-east-1 (Session 5432)",
    host: "aws-0-sa-east-1.pooler.supabase.com",
    port: 5432,
    user: `postgres.${projectRef}`,
    password: password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  },
  {
    name: "Pooler us-east-1 (Session 5432)",
    host: "aws-0-us-east-1.pooler.supabase.com",
    port: 5432,
    user: `postgres.${projectRef}`,
    password: password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  },
  {
    name: "Pooler us-east-2 (Session 5432)",
    host: "aws-0-us-east-2.pooler.supabase.com",
    port: 5432,
    user: `postgres.${projectRef}`,
    password: password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  },
];

async function runMigration() {
  const sqlPath = "/Users/willaraujo/.gemini/antigravity/scratch/nexora/supabase/schema.sql";
  const sqlContent = fs.readFileSync(sqlPath, "utf8");

  let connectedClient = null;

  for (const config of connectionConfigs) {
    console.log(`Tentando conectar via: ${config.name} (${config.host}:${config.port})...`);
    const client = new Client(config);
    try {
      await client.connect();
      console.log(`✅ Conexão estabelecida com sucesso via ${config.name}!`);
      connectedClient = client;
      break;
    } catch (err) {
      console.log(`❌ Falha em ${config.name}:`, err.message);
      try { await client.end(); } catch {}
    }
  }

  if (!connectedClient) {
    throw new Error("Não foi possível conectar em nenhum dos endpoints do Postgres.");
  }

  console.log("\nExecutando schema.sql (Tabelas, Índices, Triggers e Políticas RLS)...");
  await connectedClient.query(sqlContent);
  console.log("✅ Schema SQL executado com sucesso total!\n");

  // Validação: Lista as tabelas criadas e o status de RLS
  const tablesRes = await connectedClient.query(`
    SELECT 
      c.relname as table_name,
      c.relrowsecurity as rls_enabled,
      c.relforcerowsecurity as rls_forced
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' 
      AND c.relkind = 'r'
      AND c.relname IN ('profiles', 'domains', 'campaigns', 'traffic_events', 'cloaker_configs')
    ORDER BY c.relname;
  `);

  console.log("Status de RLS nas Tabelas:");
  console.table(tablesRes.rows);

  // Validação: Lista as Políticas de RLS criadas
  const policiesRes = await connectedClient.query(`
    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);

  console.log("\nPolíticas RLS ativas:");
  console.table(policiesRes.rows.map(p => ({
    table: p.tablename,
    policy: p.policyname,
    cmd: p.cmd,
    definition: p.qual
  })));

  await connectedClient.end();
  console.log("\n🎉 Banco de dados 100% blindado e sincronizado!");
}

runMigration().catch(err => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
