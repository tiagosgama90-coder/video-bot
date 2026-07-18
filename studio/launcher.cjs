const { exec } = require('child_process');
const { criarServidor } = require('./server.cjs');
const { resolverRaizProjeto } = require('./backend.cjs');

async function start(opcoes = {}) {
  const abrirBrowser = opcoes.abrirBrowser !== false;
  const root = opcoes.root || resolverRaizProjeto();
  const app = criarServidor({ root, onLog: opcoes.onLog });

  const url = await app.start();
  console.log('');
  console.log('  Sidus Studio');
  console.log('  Projeto:', root);
  console.log('  URL:    ', url);
  console.log('');
  console.log('  Fecha esta janela para sair.');
  console.log('');

  if (abrirBrowser) {
    if (process.platform === 'win32') {
      exec(`start "" "${url}"`, { shell: true });
    } else if (process.platform === 'darwin') {
      exec(`open "${url}"`);
    } else {
      exec(`xdg-open "${url}"`);
    }
  }

  return { url, root, server: app.server };
}

module.exports = { start };

if (require.main === module) {
  start().catch((e) => {
    console.error('Erro ao iniciar Sidus Studio:', e.message || e);
    if (process.platform === 'win32') {
      exec('pause', { shell: true });
    }
    process.exit(1);
  });
}
