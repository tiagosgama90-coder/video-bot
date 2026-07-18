const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'config', 'sidusastro.json');
const MUSICAS_DIR = path.join(ROOT, 'config', 'musicas');
const OUTPUT_DIR = path.join(ROOT, 'output');

let mainWindow = null;
let processoAtivo = null;

function criarJanela() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 780,
    minWidth: 800,
    minHeight: 640,
    title: 'Sidus Studio',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
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
      mainWindow?.webContents.send('log', t);
    });
    child.stderr.on('data', (d) => {
      const t = d.toString();
      saida += t;
      mainWindow?.webContents.send('log', t);
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

app.whenReady().then(() => {
  criarJanela();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      criarJanela();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-paths', () => ({
  root: ROOT,
  config: CONFIG_PATH,
  output: OUTPUT_DIR,
  musicas: MUSICAS_DIR,
}));

ipcMain.handle('load-config', () => lerConfig());

ipcMain.handle('save-config', (_e, config) => {
  guardarConfig(config);
  return true;
});

ipcMain.handle('list-videos', () => listarVideos());

ipcMain.handle('open-output', () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  shell.openPath(OUTPUT_DIR);
});

ipcMain.handle('open-video', (_e, caminho) => {
  shell.openPath(caminho);
});

ipcMain.handle('import-music', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Importar música MP3',
    filters: [{ name: 'MP3', extensions: ['mp3'] }],
    properties: ['openFile'],
  });
  if (result.canceled || !result.filePaths[0]) {
    return null;
  }
  if (!fs.existsSync(MUSICAS_DIR)) {
    fs.mkdirSync(MUSICAS_DIR, { recursive: true });
  }
  const origem = result.filePaths[0];
  const nome = path.basename(origem);
  const destino = path.join(MUSICAS_DIR, nome);
  fs.copyFileSync(origem, destino);
  return { nome, fonte: 'config/musicas/' + nome.replace(/\\/g, '/') };
});

ipcMain.handle('gerar-teste', async (_e, locale) => {
  const env = {
    SKIP_PUBLICAR: '1',
    TESTE_LOCAL: '1',
    LOCALE: locale === 'en-US' ? 'en-US' : 'pt-PT',
  };
  const cmd = locale === 'en-US' ? 'npm run gerar-us' : 'npm run gerar';
  await executarComando(cmd, [], env);
  return listarVideos();
});

ipcMain.handle('testar-voz', async (_e, locale) => {
  const env = { LOCALE: locale === 'en-US' ? 'en-US' : 'pt-PT' };
  await executarComando('npx', ['ts-node', 'scripts/testar-voz.ts'], env);
  const preview = path.join(ROOT, 'public', 'preview-voz.mp3');
  if (fs.existsSync(preview)) {
    shell.openPath(preview);
  }
});
