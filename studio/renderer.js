let config = null;

function log(msg) {
  const el = document.getElementById('log');
  el.textContent += msg;
  el.scrollTop = el.scrollHeight;
}

function setStatus(msg) {
  document.getElementById('status').textContent = msg;
}

function linhasParaArray(texto) {
  return texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function arrayParaLinhas(arr) {
  return (arr || []).join('\n');
}

function renderMusicas() {
  const ul = document.getElementById('lista-musicas');
  ul.innerHTML = '';
  (config.musica.entradas || []).forEach((entrada, i) => {
    const li = document.createElement('li');
    li.innerHTML =
      '<span><strong>' +
      (entrada.nome || 'Música ' + (i + 1)) +
      '</strong><br><small>' +
      entrada.fonte +
      '</small></span>';
    const acoes = document.createElement('span');
    acoes.className = 'li-acoes';
    const btnOuvir = document.createElement('button');
    btnOuvir.textContent = '▶ Ouvir';
    btnOuvir.onclick = () => window.sidusStudio.openMusic(entrada.fonte);
    const btn = document.createElement('button');
    btn.textContent = 'Remover';
    btn.onclick = () => {
      config.musica.entradas.splice(i, 1);
      renderMusicas();
    };
    acoes.appendChild(btnOuvir);
    acoes.appendChild(btn);
    li.appendChild(acoes);
    ul.appendChild(li);
  });
}

async function atualizarGit() {
  const info = await window.sidusStudio.gitInfo();
  const branchEl = document.getElementById('git-branch');
  const remoteEl = document.getElementById('git-remote');
  const statusEl = document.getElementById('git-status');
  if (!info.ok) {
    branchEl.textContent = '—';
    remoteEl.textContent = '—';
    statusEl.textContent = 'Git não disponível: ' + info.erro;
    return;
  }
  branchEl.textContent = info.branch || '—';
  remoteEl.textContent = info.remote || '—';
  statusEl.textContent = info.status.trim() || '(sem alterações pendentes)';
}

async function renderVideos() {
  const ul = document.getElementById('lista-videos');
  ul.innerHTML = '';
  const videos = await window.sidusStudio.listVideos();
  videos.slice(0, 10).forEach((v) => {
    const li = document.createElement('li');
    li.innerHTML = '<span>' + v.nome + '</span>';
    const btn = document.createElement('button');
    btn.textContent = 'Abrir';
    btn.onclick = () => window.sidusStudio.openVideo(v.caminho);
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

function configParaForm() {
  document.getElementById('voz-preferencia').value = config.voz.preferencia;
  document.getElementById('pt-fem-rate').value = config.voz.pt.femininaRate;
  document.getElementById('pt-fem-pitch').value = config.voz.pt.femininaPitch;
  document.getElementById('pt-masc-rate').value = config.voz.pt.masculinaRate;
  document.getElementById('pt-masc-pitch').value = config.voz.pt.masculinaPitch;
  document.getElementById('en-fem-rate').value = config.voz.en.femininaRate;
  document.getElementById('en-fem-pitch').value = config.voz.en.femininaPitch;
  document.getElementById('en-masc-rate').value = config.voz.en.masculinaRate;
  document.getElementById('en-masc-pitch').value = config.voz.en.masculinaPitch;
  document.getElementById('musica-volume').value = config.musica.volume;
  document.getElementById('musica-volume-val').textContent = String(config.musica.volume);
  document.getElementById('imagem-temas').value = arrayParaLinhas(config.imagem.temas);
  document.getElementById('imagem-mods').value = arrayParaLinhas(config.imagem.modificadores);
  document.getElementById('imagem-paletas').value = arrayParaLinhas(config.imagem.paletas);
  document.getElementById('imagem-sufixo').value = config.imagem.sufixoPrompt || '';
  renderMusicas();
}

function formParaConfig() {
  config.voz.preferencia = document.getElementById('voz-preferencia').value;
  config.voz.pt.femininaRate = document.getElementById('pt-fem-rate').value;
  config.voz.pt.femininaPitch = document.getElementById('pt-fem-pitch').value;
  config.voz.pt.masculinaRate = document.getElementById('pt-masc-rate').value;
  config.voz.pt.masculinaPitch = document.getElementById('pt-masc-pitch').value;
  config.voz.en.femininaRate = document.getElementById('en-fem-rate').value;
  config.voz.en.femininaPitch = document.getElementById('en-fem-pitch').value;
  config.voz.en.masculinaRate = document.getElementById('en-masc-rate').value;
  config.voz.en.masculinaPitch = document.getElementById('en-masc-pitch').value;
  config.musica.volume = parseFloat(document.getElementById('musica-volume').value);
  config.musica.sempreZen = true;
  config.imagem.temas = linhasParaArray(document.getElementById('imagem-temas').value);
  config.imagem.modificadores = linhasParaArray(document.getElementById('imagem-mods').value);
  config.imagem.paletas = linhasParaArray(document.getElementById('imagem-paletas').value);
  config.imagem.sufixoPrompt = document.getElementById('imagem-sufixo').value;
}

document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

document.getElementById('musica-volume').addEventListener('input', (e) => {
  document.getElementById('musica-volume-val').textContent = e.target.value;
});

document.getElementById('btn-guardar').addEventListener('click', async () => {
  formParaConfig();
  await window.sidusStudio.saveConfig(config);
  setStatus('✅ Guardado — próximo disparo usa estas definições.');
});

document.getElementById('btn-add-musica-url').addEventListener('click', () => {
  const url = prompt('URL da música MP3 (Jamendo, Pixabay, etc.):');
  if (!url) return;
  const nome = prompt('Nome para identificar:', 'Nova música') || 'Nova música';
  config.musica.entradas.push({ nome, fonte: url.trim() });
  renderMusicas();
});

document.getElementById('btn-import-musica').addEventListener('click', async () => {
  const r = await window.sidusStudio.importMusic();
  if (r) {
    config.musica.entradas.push({ nome: r.nome, fonte: r.fonte });
    renderMusicas();
    setStatus('Música importada: ' + r.nome);
  }
});

function renderCatalogo(faixas) {
  const ul = document.getElementById('lista-catalogo');
  ul.innerHTML = '';
  (faixas || []).forEach((f) => {
    const li = document.createElement('li');
    const info = document.createElement('span');
    const dur = f.duracao ? Math.round(f.duracao) + 's · ' : '';
    info.innerHTML =
      '<strong>' +
      f.nome +
      '</strong>' +
      (f.artista ? ' — ' + f.artista : '') +
      '<br><small>' +
      dur +
      (f.tags || '') +
      '</small>';
    const acoes = document.createElement('span');
    acoes.className = 'li-acoes';
    const btnOuvir = document.createElement('button');
    btnOuvir.textContent = '▶ Ouvir';
    btnOuvir.onclick = () => window.sidusStudio.openMusic(f.fonte);
    const btnAdd = document.createElement('button');
    btnAdd.textContent = '+ Usar';
    btnAdd.onclick = () => {
      const ja = config.musica.entradas.some((e) => e.fonte === f.fonte);
      if (ja) {
        setStatus('Já está na lista ativa.');
        return;
      }
      config.musica.entradas.push({ nome: f.nome, fonte: f.fonte });
      renderMusicas();
      setStatus('Adicionada: ' + f.nome + ' — guarda ou envia para GitHub.');
    };
    acoes.appendChild(btnOuvir);
    acoes.appendChild(btnAdd);
    li.appendChild(info);
    li.appendChild(acoes);
    ul.appendChild(li);
  });
}

async function atualizarStatusCatalogo() {
  const el = document.getElementById('catalogo-status');
  const st = await window.sidusStudio.musicSearchStatus();
  const partes = [];
  if (st.jamendo) partes.push('✅ Jamendo');
  else partes.push('❌ Jamendo (falta JAMENDO_CLIENT_ID no .env)');
  if (st.pixabay) partes.push('✅ Pixabay');
  else partes.push('❌ Pixabay (falta PIXABAY_API_KEY no .env)');
  el.textContent = partes.join(' · ');
}

async function pesquisarCatalogo(query) {
  const q = query || document.getElementById('catalogo-query').value;
  const fonte = document.getElementById('catalogo-fonte').value;
  setStatus('A pesquisar em ' + fonte + '...');
  const r = await window.sidusStudio.searchMusic(q, fonte, 1);
  if (!r.ok) {
    setStatus('❌ ' + r.erro);
    renderCatalogo([]);
    return;
  }
  renderCatalogo(r.faixas);
  setStatus('✅ ' + r.faixas.length + ' resultados — clica + Usar nas que gostares.');
}

document.getElementById('btn-catalogo-pesquisar').addEventListener('click', () => pesquisarCatalogo());
document.getElementById('btn-catalogo-enigma').addEventListener('click', () => {
  document.getElementById('catalogo-query').value = 'enigma gregorian ethereal meditation sensual new age';
  pesquisarCatalogo();
});
document.getElementById('btn-catalogo-gregorian').addEventListener('click', () => {
  document.getElementById('catalogo-query').value = 'gregorian chant monks spiritual';
  pesquisarCatalogo();
});
document.getElementById('btn-catalogo-worldbeat').addEventListener('click', () => {
  document.getElementById('catalogo-query').value = 'worldbeat tribal ethnic ambient';
  pesquisarCatalogo();
});
document.getElementById('btn-catalogo-zen').addEventListener('click', () => {
  document.getElementById('catalogo-query').value = 'zen meditation relaxing sensual pads';
  pesquisarCatalogo();
});
document.getElementById('catalogo-query').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') pesquisarCatalogo();
});

document.getElementById('btn-git-atualizar').addEventListener('click', () => atualizarGit());

document.getElementById('btn-git-enviar').addEventListener('click', async () => {
  formParaConfig();
  await window.sidusStudio.saveConfig(config);
  const mensagem = document.getElementById('git-mensagem').value;
  setStatus('A enviar para GitHub...');
  try {
    const r = await window.sidusStudio.gitCommitPush(mensagem);
    if (r.aviso) {
      setStatus('ℹ️ ' + r.aviso);
    } else {
      setStatus('✅ Enviado para GitHub (' + r.branch + ')');
    }
    await atualizarGit();
  } catch (e) {
    setStatus('❌ Erro Git — vê o log');
    log('\nGIT: ' + String(e));
  }
});

document.getElementById('btn-open-output').addEventListener('click', () => {
  window.sidusStudio.openOutput();
});

async function correrGeracao(locale) {
  formParaConfig();
  await window.sidusStudio.saveConfig(config);
  document.getElementById('log').textContent = '';
  setStatus('A gerar vídeo...');
  try {
    await window.sidusStudio.gerarTeste(locale);
    await renderVideos();
    setStatus('✅ Vídeo gerado — vê em output/');
    window.sidusStudio.openOutput();
  } catch (e) {
    setStatus('❌ Erro — vê o log');
    log('\nERRO: ' + String(e));
  }
}

document.getElementById('btn-gerar-pt').addEventListener('click', () => correrGeracao('pt-PT'));
document.getElementById('btn-gerar-en').addEventListener('click', () => correrGeracao('en-US'));
document.getElementById('btn-testar-voz-pt').addEventListener('click', async () => {
  formParaConfig();
  await window.sidusStudio.saveConfig(config);
  setStatus('A gerar preview de voz PT...');
  await window.sidusStudio.testarVoz('pt-PT');
  setStatus('Preview em public/preview-voz.mp3');
});
document.getElementById('btn-testar-voz-en').addEventListener('click', async () => {
  formParaConfig();
  await window.sidusStudio.saveConfig(config);
  setStatus('A gerar preview de voz EN...');
  await window.sidusStudio.testarVoz('en-US');
  setStatus('Preview em public/preview-voz.mp3');
});

window.sidusStudio.onLog((msg) => log(msg));

(async () => {
  config = await window.sidusStudio.loadConfig();
  if (!config) {
    setStatus('Config não encontrada — guarda para criar.');
    config = {
      projeto: 'SidusAstro',
      voz: {
        preferencia: 'aleatoria',
        pt: {
          femininaId: 'pt-PT-RaquelNeural',
          masculinaId: 'pt-PT-DuarteNeural',
          femininaRate: '-15%',
          femininaPitch: '+3%',
          masculinaRate: '-14%',
          masculinaPitch: '+1%',
          volume: 'soft',
        },
        en: {
          femininaId: 'en-US-AriaNeural',
          masculinaId: 'en-US-RogerNeural',
          femininaRate: '-12%',
          femininaPitch: '+2%',
          masculinaRate: '-11%',
          masculinaPitch: '0%',
          volume: 'soft',
        },
        pausaFraseMs: 550,
        pausaVirgulaMs: 250,
      },
      musica: { volume: 0.22, sempreZen: true, entradas: [] },
      imagem: { temas: [], modificadores: [], paletas: [], sufixoPrompt: '' },
    };
  }
  configParaForm();
  await renderVideos();
  await atualizarGit();
  await atualizarStatusCatalogo();
})();
