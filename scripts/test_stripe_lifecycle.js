/**
 * =============================================================================
 * SUÍTE DE TESTES E2E DO CICLO DE VIDA STRIPE (LOCAL)
 * =============================================================================
 * 
 * Testa localmente sem depender de deploy na Vercel:
 * 1. Upgrade de plano pós-checkout (checkout.session.completed)
 * 2. Validação da vigência de 30 dias (current_period_end)
 * 3. Renovação automática a cada 30 dias (invoice.payment_succeeded)
 * 4. Inadimplência / Falha de pagamento (invoice.payment_failed) -> Bloqueio imediato
 * 5. Cancelamento de assinatura (customer.subscription.deleted) -> Revogação de benefícios
 * 6. Teste de trava de limites reais (Domínios, Campanhas e Restrição de Países)
 */

const http = require('http');
const crypto = require('crypto');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function postJson(endpoint, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      `${BASE_URL}${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

async function getJson(endpoint) {
  return new Promise((resolve, reject) => {
    const req = http.request(`${BASE_URL}${endpoint}`, { method: 'GET' }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

function printHeader(title) {
  console.log('\n=============================================================================');
  console.log(`📌 ${title}`);
  console.log('=============================================================================');
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ SUCESSO: ${message}`);
  }
}

async function runTests() {
  console.log('🚀 Iniciando Suíte de Testes do Ciclo Stripe Local...');
  const testUserId = crypto.randomUUID();
  const testEmail = `operador.teste.${Date.now()}@phantom-x.pro`;
  const testCustomerId = `cus_test_${Date.now()}`;
  const testSubId = `sub_test_${Date.now()}`;

  console.log(`👤 Operador de Teste: ${testEmail} (ID: ${testUserId})`);
  console.log(`💳 Stripe IDs: Customer: ${testCustomerId} | Sub: ${testSubId}`);

  // -------------------------------------------------------------------------
  // TESTE 1: Estado Inicial (Usuário Novo no Plano Free / Trial)
  // -------------------------------------------------------------------------
  printHeader('TESTE 1: Sincronização Inicial (Usuário Free / Trial)');
  const initialSync = await postJson('/api/v1/auth/sync', {
    userId: testUserId,
    email: testEmail,
  });
  assert(initialSync.status === 200, 'Endpoint /api/v1/auth/sync respondeu 200 OK');
  assert(
    initialSync.body?.plan === 'free',
    `Plano inicial é FREE (esperado: free, recebido: ${initialSync.body?.plan})`
  );
  assert(
    initialSync.body?.isPaid === false,
    'Status de pagamento inicial é NÃO PAGO (isPaid: false)'
  );

  // -------------------------------------------------------------------------
  // TESTE 2: Upgrade Pós-Checkout (checkout.session.completed)
  // -------------------------------------------------------------------------
  printHeader('TESTE 2: Upgrade via Stripe Webhook (checkout.session.completed - Plano Growth R$ 389)');
  const thirtyDaysLater = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;

  const checkoutPayload = {
    id: `evt_test_checkout_${Date.now()}`,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: `cs_test_${Date.now()}`,
        customer: testCustomerId,
        customer_email: testEmail,
        subscription: testSubId,
        metadata: {
          userId: testUserId,
          planId: 'growth',
        },
        current_period_end: thirtyDaysLater,
      },
    },
  };

  const webhookResp1 = await postJson('/api/v1/billing/webhook', checkoutPayload);
  assert(webhookResp1.status === 200, 'Webhook Stripe processou checkout.session.completed com 200 OK');

  // Verifica sincronização imediata
  const syncAfterUpgrade = await postJson('/api/v1/auth/sync', {
    userId: testUserId,
    email: testEmail,
  });
  assert(
    syncAfterUpgrade.body?.plan === 'growth',
    `Plano liberado imediatamente: GROWTH (esperado: growth, recebido: ${syncAfterUpgrade.body?.plan})`
  );
  assert(
    syncAfterUpgrade.body?.planStatus === 'active',
    `Status do plano é ACTIVE (esperado: active, recebido: ${syncAfterUpgrade.body?.planStatus})`
  );
  assert(
    syncAfterUpgrade.body?.isPaid === true,
    'Usuário marcado como assinante pagante real (isPaid: true)'
  );
  assert(
    Boolean(syncAfterUpgrade.body?.planExpiresAt),
    `Data de expiração de 30 dias gerada: ${syncAfterUpgrade.body?.planExpiresAt}`
  );

  // -------------------------------------------------------------------------
  // TESTE 3: Renovação Automática a cada 30 Dias (invoice.payment_succeeded)
  // -------------------------------------------------------------------------
  printHeader('TESTE 3: Renovação Recorrente após 30 Dias (invoice.payment_succeeded)');
  const sixtyDaysLater = Math.floor(Date.now() / 1000) + 60 * 24 * 3600;

  const invoiceSucceededPayload = {
    id: `evt_test_inv_ok_${Date.now()}`,
    type: 'invoice.payment_succeeded',
    data: {
      object: {
        id: `in_test_renew_${Date.now()}`,
        customer: testCustomerId,
        customer_email: testEmail,
        subscription: testSubId,
        metadata: {
          userId: testUserId,
        },
        lines: {
          data: [
            {
              period: {
                start: thirtyDaysLater,
                end: sixtyDaysLater,
              },
            },
          ],
        },
      },
    },
  };

  const webhookResp2 = await postJson('/api/v1/billing/webhook', invoiceSucceededPayload);
  assert(webhookResp2.status === 200, 'Webhook processou invoice.payment_succeeded com 200 OK');

  const syncAfterRenew = await postJson('/api/v1/auth/sync', {
    userId: testUserId,
    email: testEmail,
  });
  assert(
    syncAfterRenew.body?.plan === 'growth',
    'Plano permaneceu ativo como GROWTH após pagamento recorrente de renovação'
  );
  assert(
    syncAfterRenew.body?.planStatus === 'active',
    'Status continua ACTIVE após renovação'
  );
  assert(
    new Date(syncAfterRenew.body?.planExpiresAt).getTime() > Date.now() + 35 * 24 * 3600 * 1000,
    `Período estendido com sucesso para +60 dias: ${syncAfterRenew.body?.planExpiresAt}`
  );

  // -------------------------------------------------------------------------
  // TESTE 4: Inadimplência / Cartão Recusado na Renovação (invoice.payment_failed)
  // -------------------------------------------------------------------------
  printHeader('TESTE 4: Não Pagamento / Cartão Recusado (invoice.payment_failed -> Bloqueio Imediato)');
  const invoiceFailedPayload = {
    id: `evt_test_inv_fail_${Date.now()}`,
    type: 'invoice.payment_failed',
    data: {
      object: {
        id: `in_test_fail_${Date.now()}`,
        customer: testCustomerId,
        customer_email: testEmail,
        subscription: testSubId,
        metadata: {
          userId: testUserId,
        },
      },
    },
  };

  const webhookResp3 = await postJson('/api/v1/billing/webhook', invoiceFailedPayload);
  assert(webhookResp3.status === 200, 'Webhook processou invoice.payment_failed com 200 OK');

  const syncAfterFail = await postJson('/api/v1/auth/sync', {
    userId: testUserId,
    email: testEmail,
  });
  assert(
    syncAfterFail.body?.planStatus === 'expired',
    `Status marcado imediatamente como EXPIRED por falta de pagamento (recebido: ${syncAfterFail.body?.planStatus})`
  );
  assert(
    syncAfterFail.body?.isPaid === false,
    'isPaid desmarcado para false (benefícios suspensos)'
  );
  assert(
    syncAfterFail.body?.effectivePlan === 'free' || syncAfterFail.body?.plan === 'free',
    `Plano efetivo rebaixado para FREE para bloquear privilégios (recebido: ${syncAfterFail.body?.effectivePlan || syncAfterFail.body?.plan})`
  );

  // -------------------------------------------------------------------------
  // TESTE 5: Cancelamento Definitivo (customer.subscription.deleted)
  // -------------------------------------------------------------------------
  printHeader('TESTE 5: Assinatura Cancelada (customer.subscription.deleted -> Downgrade Total)');
  const subDeletedPayload = {
    id: `evt_test_sub_del_${Date.now()}`,
    type: 'customer.subscription.deleted',
    data: {
      object: {
        id: testSubId,
        customer: testCustomerId,
        metadata: {
          userId: testUserId,
        },
      },
    },
  };

  const webhookResp4 = await postJson('/api/v1/billing/webhook', subDeletedPayload);
  assert(webhookResp4.status === 200, 'Webhook processou customer.subscription.deleted com 200 OK');

  const syncAfterDelete = await postJson('/api/v1/auth/sync', {
    userId: testUserId,
    email: testEmail,
  });
  assert(
    syncAfterDelete.body?.plan === 'free',
    `Plano rebaixado em definitivo para FREE (recebido: ${syncAfterDelete.body?.plan})`
  );
  assert(
    syncAfterDelete.body?.planStatus === 'canceled',
    `Status marcado como CANCELED (recebido: ${syncAfterDelete.body?.planStatus})`
  );
  assert(
    syncAfterDelete.body?.isPaid === false,
    'Usuário sem benefícios pagos ativos'
  );

  // -------------------------------------------------------------------------
  // TESTE 6: Validação de Regras de Negócio e Limites de Operação
  // -------------------------------------------------------------------------
  printHeader('TESTE 6: Validação das Travas de Segurança e Limites de Recursos');
  
  // Simulando as validações de /src/lib/plans.ts
  const { PHANTOM_PLANS, LATAM_COUNTRIES } = require('../src/lib/plans_standalone_check.js');

  // Limites do Plano Free
  const freeLimits = PHANTOM_PLANS.free.limits;
  assert(freeLimits.maxDomains === 1, 'Plano Free limita a exatamente 1 domínio');
  assert(freeLimits.maxCampaigns === 1, 'Plano Free limita a exatamente 1 camuflagem/campanha');
  assert(freeLimits.maxEventsMonthly === 100, 'Plano Free limita a exatamente 100 eventos/cliques');

  // Limites do Plano Growth
  const growthLimits = PHANTOM_PLANS.growth.limits;
  assert(growthLimits.maxDomains === 15, 'Plano Growth expande para 15 domínios');
  assert(growthLimits.maxCampaigns === 15, 'Plano Growth expande para 15 camuflagens ativas');
  assert(growthLimits.maxEventsMonthly === 100000, 'Plano Growth expande para 100.000 cliques/mês');

  // Validação de Países (Geo-Targeting)
  assert(LATAM_COUNTRIES.includes('MX'), 'Plano Growth permite México (Latam 20)');
  assert(LATAM_COUNTRIES.includes('AR'), 'Plano Growth permite Argentina (Latam 20)');
  assert(!LATAM_COUNTRIES.includes('US'), 'Plano Growth barra tráfego dos Estados Unidos (requer Scale)');
  assert(PHANTOM_PLANS.free.region === 'Brasil (1)', 'Plano Free/Expirado restringe estritamente ao Brasil 🇧🇷');

  // -------------------------------------------------------------------------
  // RESUMO GERAL
  // -------------------------------------------------------------------------
  printHeader('🏁 RESULTADO FINAL DA SUÍTE DE TESTES');
  if (process.exitCode === 1) {
    console.error('❌ Alguns testes falharam. Verifique os logs acima.');
  } else {
    console.log('🎉 TODOS OS 6 CENÁRIOS DO CICLO STRIPE PASSARAM COM 100% DE SUCESSO!');
    console.log('✓ Liberação imediata após checkout (Growth R$ 389)');
    console.log('✓ Reconhecimento de 30 dias de vigência (current_period_end)');
    console.log('✓ Renovação automática recorrente a cada 30 dias (invoice.payment_succeeded)');
    console.log('✓ Bloqueio imediato de benefícios em caso de falha de pagamento (invoice.payment_failed)');
    console.log('✓ Downgrade total para Free e bloqueio de limites na perda da assinatura (customer.subscription.deleted)');
    console.log('✓ Travas de domínio (1 max), camuflagens (1 max), cliques (100) e bloqueio internacional ativas');
  }
}

runTests().catch((err) => {
  console.error('💥 Erro fatal ao rodar testes:', err);
  process.exit(1);
});
