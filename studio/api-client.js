(function () {
  async function api(caminho, opcoes) {
    const res = await fetch('/api' + caminho, opcoes);
    if (!res.ok) {
      const texto = await res.text();
      throw new Error(texto || 'Erro ' + res.status);
    }
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      return res.json();
    }
    return res.text();
  }

  window.sidusStudio = {
    getPaths: () => api('/paths'),
    loadConfig: () => api('/load-config'),
    saveConfig: (config) =>
      api('/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      }),
    listVideos: () => api('/list-videos'),
    openOutput: () => api('/open-output', { method: 'POST' }),
    openVideo: (caminho) =>
      api('/open-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caminho }),
      }),
    openMusic: (fonte) =>
      api('/open-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fonte }),
      }),
    getMusicPresets: () => api('/music-presets'),
    musicSearchStatus: () => api('/music-search-status'),
    searchMusic: (q, fonte, page) =>
      api(
        '/search-music?' +
          new URLSearchParams({
            q: q || '',
            fonte: fonte || 'jamendo',
            page: String(page || 1),
          }).toString(),
      ),
    importMusic: () =>
      new Promise((resolve) => {
        const input = document.getElementById('input-import-mp3');
        input.onchange = async () => {
          const ficheiro = input.files[0];
          input.value = '';
          if (!ficheiro) {
            resolve(null);
            return;
          }
          try {
            const res = await fetch('/api/import-music', {
              method: 'POST',
              headers: { 'X-Filename': encodeURIComponent(ficheiro.name) },
              body: await ficheiro.arrayBuffer(),
            });
            if (!res.ok) throw new Error(await res.text());
            resolve(await res.json());
          } catch (e) {
            alert('Erro ao importar: ' + e.message);
            resolve(null);
          }
        };
        input.click();
      }),
    gerarTeste: (locale) =>
      api('/gerar-teste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      }),
    testarVoz: (locale) =>
      api('/testar-voz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      }),
    gitInfo: () => api('/git-info'),
    gitCommitPush: (mensagem) =>
      api('/git-commit-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem }),
      }),
    onLog: (cb) => {
      const es = new EventSource('/api/log-stream');
      es.onmessage = (ev) => {
        try {
          cb(JSON.parse(ev.data));
        } catch {
          cb(ev.data);
        }
      };
    },
  };
})();
