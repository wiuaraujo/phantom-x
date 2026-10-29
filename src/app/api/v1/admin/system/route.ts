import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let globalKillSwitchActive = false;

// Chaves mestras autorizadas para o Painel Admin Independente
const AUTHORIZED_MASTER_KEYS = [
  "Analivia@13@#",
  "PhantomX@2026!",
  "admin",
  "master_px_secret_key_2026",
];

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      globalKillSwitchActive,
      edgeEngineVersion: "Phantom-X Edge Core v2.4",
      cloakerMode: globalKillSwitchActive ? "EMERGENCY_SAFE_ALL" : "ACTIVE_FILTERING",
      timestamp: new Date().toISOString(),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, passkey, email, password } = body;

    // 1. AUTENTICAÇÃO MESTRE PARA O PAINEL ADMIN
    if (action === "auth_admin") {
      const input = (passkey || password || "").trim();
      const isValid = AUTHORIZED_MASTER_KEYS.includes(input);

      if (!isValid) {
        return NextResponse.json(
          {
            success: false,
            error: "Chave Mestra de Acesso Incorreta. Acesso Negado ao Terminal de Governança.",
          },
          { status: 401 }
        );
      }

      // Gera token de sessão administrativa
      const adminToken = `px_master_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

      return NextResponse.json({
        success: true,
        message: "Acesso Mestre Concedido ao Centro de Governança Phantom-X.",
        adminSession: {
          token: adminToken,
          role: "master_administrator",
          name: "Engenheiro Chefe de Operações",
          email: email || "admin@phantomx.pro",
          authenticatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        },
      });
    }

    // 2. TOGGLE DO KILL-SWITCH DE EMERGÊNCIA GLOBAL
    if (action === "toggle_killswitch") {
      globalKillSwitchActive = !globalKillSwitchActive;
      return NextResponse.json({
        success: true,
        globalKillSwitchActive,
        message: globalKillSwitchActive
          ? "KILL-SWITCH DE EMERGÊNCIA ATIVADO: Todo o tráfego do cluster agora é forçado 100% para a Safe Page."
          : "KILL-SWITCH DESATIVADO: Tráfego normalizado com filtragem heurística de borda ativa.",
      });
    }

    return NextResponse.json({ success: false, error: "Ação não suportada." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Erro no processador de sistema." },
      { status: 500 }
    );
  }
}
