/**
 * =============================================================================
 * SCRIPT DE AUTO-DEPLOY PHANTOM-X PARA GITHUB & VERCEL
 * =============================================================================
 * 
 * Este script automatiza 100% o fluxo de deploy para o GitHub:
 * 1. Carrega o token de autenticação GitHub
 * 2. Mapeia arquivos modificados, adicionados e deletados
 * 3. Faz o stage e commit com mensagem descritiva
 * 4. Realiza o push para a branch 'main' do repositório 'wiuaraujo/phantom-x'
 * 5. Dispara automaticamente a nova compilação e deploy na Vercel
 */

const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

// 1. Carrega variáveis de ambiente do .env.local se existirem
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (!process.env[key]) process.env[key] = val.trim();
      }
    });
  }
}

loadEnv();

const GITHUB_TOKEN = process.env.GITHUB_DEPLOY_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('❌ ERRO: GITHUB_DEPLOY_TOKEN não configurado no .env.local.');
  process.exit(1);
}

const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'wiuaraujo';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'phantom-x';
const AUTHOR_NAME = 'wiuaraujo';
const AUTHOR_EMAIL = 'wiuaraujo@users.noreply.github.com';

async function autoDeploy() {
  const dir = process.cwd();
  console.log('🚀 [Phantom-X Auto-Deploy] Iniciando sincronização com GitHub...');
  console.log(`📁 Repositório alvo: https://github.com/${REPO_OWNER}/${REPO_NAME}`);

  // 2. Mapeamento de status
  console.log('🔍 Analisando arquivos modificados e adicionados...');
  const statusMatrix = await git.statusMatrix({ fs, dir });

  let filesAdded = 0;
  let filesRemoved = 0;
  let hasChanges = false;

  for (const row of statusMatrix) {
    const [filepath, head, workdir, stage] = row;

    // Arquivo novo ou modificado no workdir
    if (workdir === 2) {
      if (head !== 2 || stage !== 2) {
        await git.add({ fs, dir, filepath });
        filesAdded++;
        hasChanges = true;
      }
    } 
    // Arquivo deletado no workdir
    else if (workdir === 0 && head === 1) {
      await git.remove({ fs, dir, filepath });
      filesRemoved++;
      hasChanges = true;
    }
  }

  console.log(`📊 Arquivos mapeados: +${filesAdded} preparados, -${filesRemoved} removidos.`);

  // 3. Se houver mudanças locais, cria o commit
  let commitSha = null;
  const customMessage = process.argv.slice(2).join(' ').trim();
  
  if (hasChanges) {
    const defaultMsg = `feat: update admin panel with real MRR, backend plan sync, stripe checkout and modern UI`;
    const message = customMessage || defaultMsg;

    console.log(`💾 Criando commit: "${message}"...`);
    commitSha = await git.commit({
      fs,
      dir,
      author: {
        name: AUTHOR_NAME,
        email: AUTHOR_EMAIL,
      },
      message,
    });
    console.log(`✅ Commit gerado com sucesso: ${commitSha}`);
  } else {
    console.log('ℹ️ Nenhuma alteração pendente de commit. Verificando commits locais não enviados...');
  }

  // 4. Push para a branch main no GitHub
  console.log('📤 Enviando commits para origin/main no GitHub...');
  try {
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      onAuth: () => ({
        username: GITHUB_TOKEN,
        password: '',
      }),
    });

    console.log('🎉 Push concluído com sucesso no GitHub!');
    console.log(`🔗 Repositório: https://github.com/${REPO_OWNER}/${REPO_NAME}/commits/main`);
    console.log('⚡ Deploy automático disparado na Vercel (https://phantom-x-two.vercel.app)');
    return { success: true, commitSha, pushResult };
  } catch (err) {
    console.error('❌ Falha ao realizar push para o GitHub:', err);
    throw err;
  }
}

autoDeploy()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
