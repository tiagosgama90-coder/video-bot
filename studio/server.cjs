const http = require('http');
const fs = require('fs');
const path = require('path');
const { criarBackend } = require('./backend.cjs');

const PORT = Number(process.env.SIDUS_STUDIO_PORT || 3847);
const STUDIO_DIR = __dirname;

function criarServidor(opcoes = {}) {
  const logClientes = new Set();
  const backend = criarBackend({
    ...opcoes,
    onLog: (msg) => {
      for (const res of logClientes) {
        res.write(`data: ${JSON.stringify(msg)}\n\n`);
      }
      if (typeof opcoes.onLog === 'function') {
        opcoes.onLog(msg);
      }
    },
  });

  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.ico': 'image/x-icon',
  };

  function servirEstatico(req, res) {
    let rel = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    if (rel.includes('..')) {
      res.writeHead(403);
      res.end('Forbidden');
      return true;
    }
    const ficheiro = path.join(STUDIO_DIR, rel);
    if (!ficheiro.startsWith(STUDIO_DIR) || !fs.existsSync(ficheiro) || fs.statSync(ficheiro).isDirectory()) {
      return false;
    }
    const ext = path.extname(ficheiro);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    fs.createReadStream(ficheiro).pipe(res);
    return true;
  }

  async function lerBody(req) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });
  }

  const rotas = {
  'GET /api/paths': () => backend.getPaths(),
  'GET /api/load-config': () => backend.loadConfig(),
  'POST /api/save-config': async (body) => {
    backend.saveConfig(JSON.parse(body.toString('utf8')));
    return true;
  },
  'GET /api/list-videos': () => backend.listVideos(),
  'POST /api/open-output': () => {
    backend.openOutput();
    return true;
  },
  'POST /api/open-video': async (body) => {
    const { caminho } = JSON.parse(body.toString('utf8'));
    backend.openVideo(caminho);
    return true;
  },
  'POST /api/open-music': async (body) => {
    const { fonte } = JSON.parse(body.toString('utf8'));
    backend.openMusic(fonte);
    return true;
  },
  'GET /api/music-presets': () => backend.getMusicPresets(),
  'POST /api/gerar-teste': async (body) => {
    const { locale } = JSON.parse(body.toString('utf8'));
    return backend.gerarTeste(locale);
  },
  'POST /api/testar-voz': async (body) => {
    const { locale } = JSON.parse(body.toString('utf8'));
    await backend.testarVoz(locale);
    return true;
  },
  'GET /api/git-info': () => backend.gitInfo(),
  'POST /api/git-commit-push': async (body) => {
    const { mensagem } = JSON.parse(body.toString('utf8'));
    return backend.gitCommitPush(mensagem);
  },
  'POST /api/import-music': async (body, req) => {
    const nome = decodeURIComponent(req.headers['x-filename'] || 'musica.mp3');
    return backend.importMusicBuffer(nome, body);
  },
};

  const server = http.createServer(async (req, res) => {
    try {
      if (req.url === '/api/log-stream' && req.method === 'GET') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });
        res.write('\n');
        logClientes.add(res);
        req.on('close', () => logClientes.delete(res));
        return;
      }

      const chave = `${req.method} ${req.url.split('?')[0]}`;
      if (rotas[chave]) {
        const body = req.method === 'POST' ? await lerBody(req) : null;
        const resultado = await rotas[chave](body, req);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(resultado));
        return;
      }

      if (req.method === 'GET' && servirEstatico(req, res)) {
        return;
      }

      res.writeHead(404);
      res.end('Not found');
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(String(e.message || e));
    }
  });

  return {
    server,
    backend,
    port: PORT,
    start: () =>
      new Promise((resolve) => {
        server.listen(PORT, '127.0.0.1', () => resolve(`http://127.0.0.1:${PORT}`));
      }),
  };
}

module.exports = { criarServidor, PORT };

if (require.main === module) {
  const { start } = require('./launcher.cjs');
  start({ abrirBrowser: false }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
