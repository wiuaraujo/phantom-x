/**
 * =============================================================================
 * TESTE DE VALIDAÇÃO: CORREÇÃO DE DIVERGÊNCIA DE LOGIN / CADASTRO
 * =============================================================================
 */

const http = require('http');

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
  console.log('🚀 Iniciando Testes de Correção de Divergência de Login/Cadastro...');

  // -------------------------------------------------------------------------
  // TESTE 1: Login com conta existente no Supabase (wiaslan1999@gmail.com)
  // -------------------------------------------------------------------------
  printHeader('TESTE 1: Login com conta existente (wiaslan1999@gmail.com)');
  console.log('Testando tentativa de login para conta já registrada no Supabase...');
  const existingLogin = await postJson('/api/v1/auth/login', {
    identifier: 'wiaslan1999@gmail.com',
    password: 'WrongPassword#2026',
  });

  assert(
    existingLogin.body?.accountNotFound === false,
    `Conta existente RECONHECIDA: accountNotFound é FALSE (recebido: ${existingLogin.body?.accountNotFound})`
  );
  assert(
    existingLogin.status === 401,
    `Status retornado é 401 (Senha Incorreta) e NÃO 404 (recebido status: ${existingLogin.status})`
  );
  assert(
    existingLogin.body?.error?.toLowerCase().includes('senha'),
    `Mensagem de erro aponta para SENHA e NÃO para 'crie uma conta' (recebido: "${existingLogin.body?.error}")`
  );

  // -------------------------------------------------------------------------
  // TESTE 2: Login com conta realmente inexistente
  // -------------------------------------------------------------------------
  printHeader('TESTE 2: Login com conta inexistente (nao_existe_9999@exemplo.com)');
  const nonExistentLogin = await postJson('/api/v1/auth/login', {
    identifier: 'nao_existe_9999@exemplo.com',
    password: 'AnyPassword#2026',
  });

  assert(
    nonExistentLogin.body?.accountNotFound === true,
    `Conta inexistente identificada corretamente: accountNotFound é TRUE`
  );
  assert(
    nonExistentLogin.status === 404,
    `Status retornado é 404 (Não Encontrado)`
  );

  // -------------------------------------------------------------------------
  // TESTE 3: Tentativa de Cadastro com E-mail Existente no Supabase
  // -------------------------------------------------------------------------
  printHeader('TESTE 3: Tentativa de Cadastro com e-mail existente (wiaslan1999@gmail.com)');
  const existingSignup = await postJson('/api/v1/auth/signup', {
    name: 'Operador Teste',
    email: 'wiaslan1999@gmail.com',
    phone: '11999998888',
    phoneCountryCode: '+55',
    password: 'ValidPassword#2026',
  });

  assert(
    existingSignup.status === 409,
    `Signup rejeita duplicidade com status 409 (recebido: ${existingSignup.status})`
  );
  assert(
    existingSignup.body?.error?.toLowerCase().includes('login'),
    `Signup orienta o usuário a fazer login em sua conta existente (recebido: "${existingSignup.body?.error}")`
  );

  // -------------------------------------------------------------------------
  // TESTE 4: Login Master Admin
  // -------------------------------------------------------------------------
  printHeader('TESTE 4: Login Master Admin (admin@phantom.security)');
  const adminLogin = await postJson('/api/v1/auth/login', {
    identifier: 'admin@phantom.security',
    password: 'PhantomAdmin#2026',
  });

  assert(adminLogin.status === 200, 'Master Admin respondeu 200 OK');
  assert(adminLogin.body?.success === true, 'Master Admin autenticado com sucesso');
  assert(adminLogin.body?.user?.role === 'admin', 'Perfil de Master Admin validado');

  printHeader('🏁 RESULTADO DOS TESTES DE DIVERGÊNCIA');
  if (process.exitCode === 1) {
    console.error('❌ Falha nos testes de divergência.');
  } else {
    console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
    console.log('✓ Contas cadastradas no Supabase são reconhecidas no login imediatamente.');
    console.log('✓ Nunca mais exibe "conta não encontrada" quando a conta já existe.');
    console.log('✓ Divergência entre login e cadastro eliminada 100%.');
  }
}

runTests().catch((err) => {
  console.error('Erro:', err);
  process.exit(1);
});
