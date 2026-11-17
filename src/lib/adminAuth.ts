import { NextRequest } from "next/server";

// E-mails autorizados para acesso ao Painel Admin Master
export const ALLOWED_ADMIN_EMAILS = [
  "admin@phantom.security",
  "admin@phantom-x.pro",
];

// Chaves mestras de alta entropia autorizadas exclusivamente para Master Admin
export const AUTHORIZED_MASTER_KEYS = [
  "PhantomAdmin#2026",
  "AdminMaster#2026",
  "Analivia@13@#",
  "PhantomX@2026!",
];

/**
 * Validador de Token Administrativo Seguro
 */
export function verifyMasterAdminAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const customHeader = req.headers.get("x-phantom-admin-token");
  const cookieAdminToken = req.cookies.get("phantom_admin_token")?.value;

  const candidate = bearerToken || customHeader || cookieAdminToken;
  if (!candidate || !candidate.startsWith("px_master_")) {
    return false;
  }
  return true;
}
