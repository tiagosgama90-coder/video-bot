const https = require('https');
const http = require('http');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib
      .get(url, { headers: { 'User-Agent': 'SidusStudio/1.0' } }, (res) => {
        let data = '';
        res.on('data', (c) => {
          data += c;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error(data.slice(0, 300) || 'Resposta inválida'));
          }
        });
      })
      .on('error', reject);
  });
}

function extrairUrlPixabay(hit) {
  return (
    hit.audio ||
    hit.audioURL ||
    hit.audio_url ||
    hit.downloadURL ||
    hit.download_url ||
    (hit.audio_files && hit.audio_files.mp3) ||
    null
  );
}

async function pesquisarJamendo(opcoes) {
  const clientId = opcoes.clientId?.trim();
  if (!clientId) {
    return { ok: false, erro: 'JAMENDO_CLIENT_ID em falta no .env — regista-te grátis em https://devportal.jamendo.com' };
  }

  const page = Math.max(1, Number(opcoes.page) || 1);
  const limit = Math.min(50, Math.max(5, Number(opcoes.limit) || 30));
  const query = (opcoes.query || 'enigma gregorian meditation world ambient').trim();

  const params = new URLSearchParams({
    client_id: clientId,
    format: 'json',
    limit: String(limit),
    offset: String((page - 1) * limit),
    include: 'musicinfo',
    audioformat: 'mp32',
    audiodlformat: 'mp32',
    search: query,
    order: 'popularity_total',
  });

  const data = await fetchJson(`https://api.jamendo.com/v3.0/tracks/?${params}`);
  if (data.headers?.status === 'failed') {
    return { ok: false, erro: data.headers.error_message || 'Erro Jamendo' };
  }

  const faixas = (data.results || [])
    .map((t) => {
      const url = t.audiodownload_allowed ? t.audiodownload || t.audio : t.audio;
      if (!url) return null;
      return {
        nome: t.name,
        artista: t.artist_name,
        fonte: url,
        duracao: t.duration,
        tags: (t.musicinfo?.tags?.genres || []).join(', ') || (t.tags || '').replace(/\+/g, ', '),
        catalogo: 'jamendo',
        id: String(t.id),
      };
    })
    .filter(Boolean);

  return {
    ok: true,
    fonte: 'jamendo',
    query,
    page,
    total: data.headers?.results_count ?? faixas.length,
    faixas,
  };
}

async function pesquisarPixabay(opcoes) {
  const apiKey = opcoes.apiKey?.trim();
  if (!apiKey) {
    return {
      ok: false,
      erro: 'PIXABAY_API_KEY em falta no .env — chave grátis em https://pixabay.com/api/docs/',
    };
  }

  const page = Math.max(1, Number(opcoes.page) || 1);
  const perPage = Math.min(50, Math.max(5, Number(opcoes.limit) || 30));
  const query = (opcoes.query || 'gregorian chant meditation enigma').trim();

  const params = new URLSearchParams({
    key: apiKey,
    q: query,
    per_page: String(perPage),
    page: String(page),
  });

  const data = await fetchJson(`https://pixabay.com/api/audio/?${params}`);
  if (typeof data === 'string' && data.includes('ERROR')) {
    return { ok: false, erro: data };
  }

  const faixas = (data.hits || [])
    .map((h) => {
      const url = extrairUrlPixabay(h);
      if (!url) return null;
      const nome = h.title || h.name || h.tags || `Pixabay ${h.id}`;
      return {
        nome: String(nome).slice(0, 120),
        artista: h.user || '',
        fonte: url,
        duracao: h.duration || null,
        tags: h.tags || '',
        catalogo: 'pixabay',
        id: String(h.id),
      };
    })
    .filter(Boolean);

  return {
    ok: true,
    fonte: 'pixabay',
    query,
    page,
    total: data.totalHits ?? faixas.length,
    faixas,
  };
}

async function pesquisarMusicas(opcoes) {
  const fonte = (opcoes.fonte || 'jamendo').toLowerCase();
  if (fonte === 'pixabay') {
    return pesquisarPixabay(opcoes);
  }
  return pesquisarJamendo(opcoes);
}

function estadoApis(env) {
  return {
    jamendo: Boolean(env.JAMENDO_CLIENT_ID?.trim()),
    pixabay: Boolean(env.PIXABAY_API_KEY?.trim()),
    jamendoUrl: 'https://devportal.jamendo.com',
    pixabayUrl: 'https://pixabay.com/api/docs/',
  };
}

module.exports = { pesquisarMusicas, pesquisarJamendo, pesquisarPixabay, estadoApis };
