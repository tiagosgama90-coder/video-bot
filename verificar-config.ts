import dotenv from 'dotenv';
import { listarCanaisBuffer } from './src/lib/buffer';

dotenv.config();

async function verificar(): Promise<void> {
  console.log('\n🔍 Verificação de configuração SidusAstro Video Bot\n');

  const obrigatorios = [
    'BUFFER_ACCESS_TOKEN',
    'BUFFER_INSTAGRAM_CHANNEL_ID',
    'BUFFER_TIKTOK_CHANNEL_ID',
    'FIREBASE_STORAGE_BUCKET',
    'AZURE_SPEECH_KEY',
    'AZURE_SPEECH_REGION',
  ];

  let ok = true;

  for (const nome of obrigatorios) {
    const valor = process.env[nome];
    if (!valor || valor.trim() === '') {
      console.log('❌ ' + nome + ' — EM FALTA');
      ok = false;
    } else {
      const preview = nome.includes('TOKEN') || nome.includes('KEY') ? '***' + valor.slice(-4) : valor;
      console.log('✅ ' + nome + ' = ' + preview);
    }
  }

  if (!process.env.BUFFER_ACCESS_TOKEN) {
    console.log('\n⚠️ Sem BUFFER_ACCESS_TOKEN — não é possível validar IDs dos canais.\n');
    process.exit(ok ? 0 : 1);
  }

  console.log('\n📱 Canais Buffer na tua conta:\n');

  const canais = await listarCanaisBuffer();
  for (const canal of canais) {
    console.log('   ' + canal.service.toUpperCase().padEnd(10) + ' | ' + canal.name + ' | ID: ' + canal.id);
  }

  const igId = process.env.BUFFER_INSTAGRAM_CHANNEL_ID ?? '';
  const ttId = process.env.BUFFER_TIKTOK_CHANNEL_ID ?? '';

  const ig = canais.find((c) => c.id === igId);
  const tt = canais.find((c) => c.id === ttId);

  console.log('\n🔗 Correspondência dos IDs configurados:\n');

  if (ig) {
    console.log('✅ Instagram ID correto → ' + ig.name + ' (' + ig.service + ')');
  } else {
    console.log('❌ BUFFER_INSTAGRAM_CHANNEL_ID não encontrado na conta Buffer!');
    console.log('   Valor atual: ' + igId);
    ok = false;
  }

  if (tt) {
    console.log('✅ TikTok ID correto → ' + tt.name + ' (' + tt.service + ')');
  } else {
    console.log('❌ BUFFER_TIKTOK_CHANNEL_ID não encontrado na conta Buffer!');
    console.log('   Valor atual: ' + ttId);
    ok = false;
  }

  console.log('');

  if (!ok) {
    process.exit(1);
  }

  console.log('✅ Configuração OK — pronta para gerar e publicar.\n');
}

verificar().catch((erro) => {
  console.error('❌ Erro na verificação:', erro);
  process.exit(1);
});
