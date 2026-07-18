const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');

const PRESET_MUSICAS_ZEN = [
  { nome: 'Gregorian Chant — Matti Paalanen', fonte: 'https://prod-1.storage.jamendo.com/download/track/1209641/mp32/' },
  { nome: 'Ut queant laxis (Gregorian) — Dussum', fonte: 'https://prod-1.storage.jamendo.com/download/track/1920874/mp32/' },
  { nome: 'The Lost Chant of Gregorian Faith — Danyax', fonte: 'https://prod-1.storage.jamendo.com/download/track/479725/mp32/' },
  { nome: 'Chant a Sutra — DJ Gami.K', fonte: 'https://prod-1.storage.jamendo.com/download/track/1632054/mp32/' },
  { nome: 'Root Chakra Chant — Macroform', fonte: 'https://prod-1.storage.jamendo.com/download/track/1250839/mp32/' },
  { nome: 'Ethnic Indian Meditation — Parler', fonte: 'https://prod-1.storage.jamendo.com/download/track/1941101/mp32/' },
  { nome: 'Himalayas — Stefan Kartenberg', fonte: 'https://prod-1.storage.jamendo.com/download/track/1849314/mp32/' },
  { nome: 'Mystic Vortex — StimiBeats', fonte: 'https://prod-1.storage.jamendo.com/download/track/2043658/mp32/' },
  { nome: 'Celtic Drone Ambient — Rune X', fonte: 'https://prod-1.storage.jamendo.com/download/track/1470844/mp32/' },
  { nome: 'ZEN Trip Hop Remix — DJ Gami.K', fonte: 'https://prod-1.storage.jamendo.com/download/track/1242774/mp32/' },
  { nome: 'Baikal zen — Factory Of Echo', fonte: 'https://prod-1.storage.jamendo.com/download/track/1992751/mp32/' },
  { nome: 'StaRiverSun — KraftiM', fonte: 'https://prod-1.storage.jamendo.com/download/track/118257/mp32/' },
  { nome: 'Relaxing Ambient Meditation — Aliaksei Yukhnevich', fonte: 'https://prod-1.storage.jamendo.com/download/track/1890501/mp32/' },
  { nome: 'Zen Harmonies — Siarhei Korbut', fonte: 'https://prod-1.storage.jamendo.com/download/track/2133476/mp32/' },
  { nome: 'Zen Garden Awakening — TuneBox', fonte: 'https://prod-1.storage.jamendo.com/download/track/2255570/mp32/' },
  { nome: 'Harmonie Zen 432Hz — Kosmoze', fonte: 'https://prod-1.storage.jamendo.com/download/track/1232067/mp32/' },
  { nome: 'Mystical Light — Aufklarung', fonte: 'https://prod-1.storage.jamendo.com/download/track/1121762/mp32/' },
  { nome: 'Meditation Ambient — Osipov Vladimir', fonte: 'https://prod-1.storage.jamendo.com/download/track/1998223/mp32/' },
  { nome: 'Summer Relax Ambient — AudioInfinity', fonte: 'https://prod-1.storage.jamendo.com/download/track/1680720/mp32/' },
  { nome: 'Relaxing Ambient — MuswayStudio', fonte: 'https://prod-1.storage.jamendo.com/download/track/1641738/mp32/' },
  { nome: 'Zen — Mazelo Nostra', fonte: 'https://prod-1.storage.jamendo.com/download/track/1740769/mp32/' },
  { nome: 'To hover (meditation ambient) — Roman Batiuk', fonte: 'https://prod-1.storage.jamendo.com/download/track/1406578/mp32/' },
  { nome: 'Zen Dream Music Box — Oursvince', fonte: 'https://prod-1.storage.jamendo.com/download/track/1099221/mp32/' },
  { nome: 'Confused relaxing ambient — Ostenvegr', fonte: 'https://prod-1.storage.jamendo.com/download/track/704397/mp32/' },
  { nome: 'Relaxing Ambient Presentation — penguinmusic', fonte: 'https://prod-1.storage.jamendo.com/download/track/1969331/mp32/' },
  { nome: 'Ambient Meditation — Aliaksei Yukhnevich', fonte: 'https://prod-1.storage.jamendo.com/download/track/1890385/mp32/' },
];

const PRESET_MUSICAS_ACUSTICAS = [
  { nome: 'Relaxing acoustic', fonte: 'https://assets.mixkit.co/music/522/522.mp3' },
  { nome: 'Orchestral calm', fonte: 'https://assets.mixkit.co/music/100/100.mp3' },
  { nome: 'Acoustic guitar zen', fonte: 'https://assets.mixkit.co/music/617/617.mp3' },
  { nome: 'Flute meditation', fonte: 'https://assets.mixkit.co/music/24/24.mp3' },
  { nome: 'Peaceful flute', fonte: 'https://assets.mixkit.co/music/23/23.mp3' },
  { nome: 'Soft flute ambient', fonte: 'https://assets.mixkit.co/music/39/39.mp3' },
  { nome: 'Acoustic strings', fonte: 'https://assets.mixkit.co/music/493/493.mp3' },
  { nome: 'Native flute', fonte: 'https://assets.mixkit.co/music/15/15.mp3' },
  { nome: 'Zen flute', fonte: 'https://assets.mixkit.co/music/19/19.mp3' },
  { nome: 'Spiritual pads', fonte: 'https://assets.mixkit.co/music/525/525.mp3' },
  { nome: 'Acoustic folk calm', fonte: 'https://assets.mixkit.co/music/13/13.mp3' },
  { nome: 'Meditation harp', fonte: 'https://assets.mixkit.co/music/16/16.mp3' },
  { nome: 'Orchestral meditation', fonte: 'https://assets.mixkit.co/music/114/114.mp3' },
  { nome: 'Flute world', fonte: 'https://assets.mixkit.co/music/1106/1106.mp3' },
  { nome: 'Calm acoustic', fonte: 'https://assets.mixkit.co/music/52/52.mp3' },
];

function resolverRaizProjeto() {
  if (process.env.SIDUS_ROOT?.trim()) {
    return path.resolve(process.env.SIDUS_ROOT.trim());
  }
  const candidatos = [process.cwd(), path.dirname(process.execPath), path.join(__dirname, '..')];
  for (const inicio of candidatos) {
    let dir = inicio;
    for (let i = 0; i < 6; i++) {
      if (
        fs.existsSync(path.join(dir, 'package.json')) &&
        fs.existsSync(path.join(dir, 'config'))
      ) {
        return dir;
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  return path.join(__dirname, '..');
}

function criarBackend(opcoes = {}) {
  const ROOT = opcoes.root || resolverRaizProjeto();
  const CONFIG_PATH = path.join(ROOT, 'config', 'sidusastro.json');
  const MUSICAS_DIR = path.join(ROOT, 'config', 'musicas');
  const OUTPUT_DIR = path.join(ROOT, 'output');
  const onLog = typeof opcoes.onLog === 'function' ? opcoes.onLog : () => {};
  let processoAtivo = null;

  function emitirLog(texto) {
    onLog(String(texto));
  }

  function abrirCaminho(caminho) {
    const alvo = path.resolve(caminho);
    if (process.platform === 'win32') {
      exec(`start "" "${alvo.replace(/"/g, '""')}"`, { shell: true });
      return;
    }
    if (process.platform === 'darwin') {
      exec(`open "${alvo.replace(/"/g, '\\"')}"`);
      return;
    }
    exec(`xdg-open "${alvo.replace(/"/g, '\\"')}"`);
  }

  function abrirUrl(url) {
    if (process.platform === 'win32') {
      exec(`start "" "${url}"`, { shell: true });
      return;
    }
    if (process.platform === 'darwin') {
      exec(`open "${url}"`);
      return;
    }
    exec(`xdg-open "${url}"`);
  }

  function lerConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  }

  function guardarConfig(config) {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
    return true;
  }

  function listarVideos() {
    if (!fs.existsSync(OUTPUT_DIR)) {
      return [];
    }
    return fs
      .readdirSync(OUTPUT_DIR)
      .filter((f) => f.endsWith('.mp4'))
      .map((f) => ({
        nome: f,
        caminho: path.join(OUTPUT_DIR, f),
        modificado: fs.statSync(path.join(OUTPUT_DIR, f)).mtime.toISOString(),
      }))
      .sort((a, b) => (a.modificado < b.modificado ? 1 : -1));
  }

  function executarGit(args) {
    return new Promise((resolve, reject) => {
      const child = spawn('git', args, { cwd: ROOT, shell: false });
      let saida = '';
      let erro = '';
      child.stdout.on('data', (d) => {
        saida += d.toString();
      });
      child.stderr.on('data', (d) => {
        erro += d.toString();
      });
      child.on('close', (code) => {
        const texto = (saida + erro).trim();
        if (code === 0) {
          resolve(texto);
        } else {
          reject(new Error(texto || 'git terminou com código ' + code));
        }
      });
    });
  }

  function executarComando(comando, args, envExtra = {}) {
    return new Promise((resolve, reject) => {
      if (processoAtivo) {
        reject(new Error('Já há uma tarefa em execução.'));
        return;
      }

      const env = { ...process.env, ...envExtra };
      const isWin = process.platform === 'win32';
      const child = spawn(isWin ? 'cmd.exe' : comando, isWin ? ['/c', comando, ...args] : args, {
        cwd: ROOT,
        env,
        shell: false,
      });

      processoAtivo = child;
      let saida = '';

      child.stdout.on('data', (d) => {
        const t = d.toString();
        saida += t;
        emitirLog(t);
      });
      child.stderr.on('data', (d) => {
        const t = d.toString();
        saida += t;
        emitirLog(t);
      });

      child.on('close', (code) => {
        processoAtivo = null;
        if (code === 0) {
          resolve(saida);
        } else {
          reject(new Error('Comando terminou com código ' + code));
        }
      });
    });
  }

  return {
    ROOT,
    CONFIG_PATH,
    MUSICAS_DIR,
    OUTPUT_DIR,
    PRESET_MUSICAS_ZEN,
    PRESET_MUSICAS_ACUSTICAS,
    getPaths: () => ({
      root: ROOT,
      config: CONFIG_PATH,
      output: OUTPUT_DIR,
      musicas: MUSICAS_DIR,
    }),
    loadConfig: () => lerConfig(),
    saveConfig: (config) => guardarConfig(config),
    listVideos: () => listarVideos(),
    openOutput: () => {
      if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      }
      abrirCaminho(OUTPUT_DIR);
    },
    openVideo: (caminho) => abrirCaminho(caminho),
    openMusic: (fonte) => {
      if (!fonte) return;
      if (fonte.startsWith('http://') || fonte.startsWith('https://')) {
        abrirUrl(fonte);
        return;
      }
      const caminho = path.isAbsolute(fonte) ? fonte : path.join(ROOT, fonte);
      abrirCaminho(caminho);
    },
    getMusicPresets: () => ({
      zen: PRESET_MUSICAS_ZEN,
      acusticas: PRESET_MUSICAS_ACUSTICAS,
    }),
    importMusicBuffer: (nomeFicheiro, buffer) => {
      if (!nomeFicheiro?.toLowerCase().endsWith('.mp3')) {
        throw new Error('Só MP3 é suportado.');
      }
      if (!fs.existsSync(MUSICAS_DIR)) {
        fs.mkdirSync(MUSICAS_DIR, { recursive: true });
      }
      const nome = path.basename(nomeFicheiro);
      const destino = path.join(MUSICAS_DIR, nome);
      fs.writeFileSync(destino, buffer);
      return { nome, fonte: 'config/musicas/' + nome.replace(/\\/g, '/') };
    },
    gerarTeste: async (locale) => {
      const env = {
        SKIP_PUBLICAR: '1',
        TESTE_LOCAL: '1',
        LOCALE: locale === 'en-US' ? 'en-US' : 'pt-PT',
      };
      const cmd = locale === 'en-US' ? 'npm run gerar-us' : 'npm run gerar';
      await executarComando(cmd, [], env);
      return listarVideos();
    },
    testarVoz: async (locale) => {
      const env = { LOCALE: locale === 'en-US' ? 'en-US' : 'pt-PT' };
      await executarComando('npx', ['ts-node', 'scripts/testar-voz.ts'], env);
      const preview = path.join(ROOT, 'public', 'preview-voz.mp3');
      if (fs.existsSync(preview)) {
        abrirCaminho(preview);
      }
    },
    gitInfo: async () => {
      try {
        const branch = await executarGit(['branch', '--show-current']);
        const status = await executarGit(['status', '--porcelain']);
        const remote = await executarGit(['remote', 'get-url', 'origin']).catch(() => '');
        return { ok: true, branch: branch.trim(), status, remote: remote.trim() };
      } catch (e) {
        return { ok: false, erro: String(e.message || e) };
      }
    },
    gitCommitPush: async (mensagem) => {
      const msg = (mensagem || '').trim() || 'Atualizar config SidusAstro via Sidus Studio';
      await executarGit(['add', 'config/sidusastro.json', 'config/musicas']);
      const status = await executarGit(['status', '--porcelain']);
      if (!status.trim()) {
        return { ok: true, aviso: 'Nada para enviar — já está tudo guardado no Git.' };
      }
      await executarGit(['commit', '-m', msg]);
      const branch = (await executarGit(['branch', '--show-current'])).trim();
      await executarGit(['push', '-u', 'origin', branch]);
      return { ok: true, branch, mensagem: msg };
    },
  };
}

module.exports = { criarBackend, resolverRaizProjeto, PRESET_MUSICAS_ZEN, PRESET_MUSICAS_ACUSTICAS };
