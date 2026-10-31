const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vabwqlkmngabpwnzrdel.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhYndxbGttbmdhYnB3bnpyZGVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzIyMTUyNywiZXhwIjoyMTA4Nzk3NTI3fQ.0bEs1O5dXznMyYw-vOgFd9JwjjFlfvexkRAGm0n9L4o";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function main() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error);
    return;
  }
  console.log('Total users in Supabase:', data?.users?.length);
  for (const u of data?.users || []) {
    console.log(`- ID: ${u.id} | Email: ${u.email} | Confirmed: ${!!u.email_confirmed_at} | Phone: ${u.user_metadata?.phone || u.phone}`);
  }
}

main().catch(console.error);
