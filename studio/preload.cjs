const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sidusStudio', {
  getPaths: () => ipcRenderer.invoke('get-paths'),
  loadConfig: () => ipcRenderer.invoke('load-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  listVideos: () => ipcRenderer.invoke('list-videos'),
  openOutput: () => ipcRenderer.invoke('open-output'),
  openVideo: (caminho) => ipcRenderer.invoke('open-video', caminho),
  importMusic: () => ipcRenderer.invoke('import-music'),
  gerarTeste: (locale) => ipcRenderer.invoke('gerar-teste', locale),
  testarVoz: (locale) => ipcRenderer.invoke('testar-voz', locale),
  getMusicPresets: () => ipcRenderer.invoke('get-music-presets'),
  openMusic: (fonte) => ipcRenderer.invoke('open-music', fonte),
  gitInfo: () => ipcRenderer.invoke('git-info'),
  gitCommitPush: (mensagem) => ipcRenderer.invoke('git-commit-push', mensagem),
  onLog: (cb) => ipcRenderer.on('log', (_e, msg) => cb(msg)),
});
