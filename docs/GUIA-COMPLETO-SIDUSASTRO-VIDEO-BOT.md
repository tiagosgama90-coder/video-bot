# Guia Completo — SidusAstro Video Bot
### Como funciona, como administrar sozinho (sem Cursor)

**Repositório:** https://github.com/tiagosgama90-coder/video-bot (público)  
**Última actualização:** 30 Julho 2026

---

## Índice

1. [O que é isto?](#1-o-que-é-isto)
2. [Como funciona (diagrama simples)](#2-como-funciona)
3. [O que corre onde (e o que é grátis)](#3-o-que-corre-onde)
4. [Horários — o que sai e quando](#4-horários)
5. [cron-job.org — o despertador](#5-cron-joborg)
6. [GitHub Actions — a fábrica de vídeos](#6-github-actions)
7. [Secrets — o que guardas no GitHub](#7-secrets)
8. [Token do cron (Bearer) — o único que expiravas](#8-token-do-cron)
9. [Como saber se está tudo OK](#9-como-saber-se-está-tudo-ok)
10. [Quando algo falha — guia de emergência](#10-quando-algo-falha)
11. [O que NUNCA fazer](#11-o-que-nunca-fazer)
12. [Scripts úteis](#12-scripts-úteis)
13. [Checklist mensal (5 minutos)](#13-checklist-mensal)
14. [Perguntas frequentes](#14-faq)

---

## 1. O que é isto?

O **video-bot** é um robot que, todos os dias:

1. Vai buscar o texto do horóscopo ao site SidusAstro (Firebase)
2. Gera um vídeo vertical (voz + música + fundo cosmos + legendas)
3. Envia o vídeo para o **Buffer**
4. O Buffer publica no **TikTok** e **Instagram** nos horários certos

Faz isto em **português (PT)** e **inglês (US)** — contas diferentes.

**Tu não precisas de fazer nada todos os dias** se o cron-job.org e o GitHub estiverem OK.

---

## 2. Como funciona

```
cron-job.org (despertador, grátis)
        │
        │  HTTP POST com token Bearer
        ▼
GitHub Actions (fábrica, GRÁTIS porque repo é público)
        │
        ├── Lê horóscopo (Firebase)
        ├── Voz (Azure Speech)
        ├── Vídeo (Remotion + FFmpeg)
        ├── Upload vídeo (Cloudinary)
        └── Agenda posts (Buffer API)
                │
                ▼
        TikTok + Instagram (@sidusastro / @sidusastro_en)
```

**Importante:** Cloudinary só **guarda** o ficheiro do vídeo. Quem **trabalha** é o GitHub Actions.

---

## 3. O que corre onde

| Serviço | Função | Pagas? | Expira? |
|---------|--------|--------|---------|
| **cron-job.org** | Dispara o bot à hora certa | Não (plano grátis) | Conta não expira |
| **GitHub Actions** | Gera os vídeos | **Não** (repo público) | — |
| **GitHub Secrets** | Passwords do bot | Não | **Não** por data |
| **Token Bearer (cron)** | Chave para disparar workflows | Não | Só se escolheres data ou 1 ano sem usar |
| **Azure Speech** | Voz dos vídeos | Plano grátis com limites | Key **não** expira |
| **Buffer** | Agenda redes sociais | O teu plano Buffer | Token **não** expira |
| **Firebase** | Texto horóscopo + opcional storage | Spark grátis | JSON admin **não** expira |
| **Cloudinary** | Guardar vídeos para o Buffer | Plano grátis | Keys **não** expiram |

### Porque deixaste de pagar / ter bloqueios

- O repo era **privado** → GitHub só dava 2000 min/mês → gastavas ~4500 → **bloqueio de pagamento**
- Agora é **público** → minutos **ilimitados e grátis** (runners normais)
- **Não voltes a meter o repo privado** senão o problema volta

---

## 4. Horários

### Horóscopo diário (todos os dias)

| | Geração (cron-job.org) | Publicação Buffer |
|--|------------------------|-------------------|
| **PT** | ~07:15 Lisboa | 09:00, 13:30, 19:00 Lisboa |
| **US** | ~07:30 Nova Iorque | 09:00, 13:30, 19:00 NY |

Cada dia: **3 vídeos** de horóscopo (3 signos diferentes).

### Terça e sábado (dia afiliados)

- **1 vídeo afiliados** (fila Buffer, hora livre)
- **2 horóscopos** em vez de 3

### Vídeos especiais (cron-job.org nos dias certos)

| Vídeo | PT | US |
|-------|----|----|
| Segunda motivacional | segunda.yml | segunda-us.yml |
| Quarta VIP divulgação | quarta.yml | quarta-us.yml |
| Quinta motivacional | quinta.yml | quinta-us.yml |
| VIP dom/seg/qua/sex | vip-divulgacao.yml | vip-divulgacao-us.yml |

### Segurança extra

- **monitor-crons.yml** — se um dia o cron falhar, o GitHub tenta recuperar automaticamente (~09:30 Lisboa / ~07:45 NY)

---

## 5. cron-job.org

### O que é

Site grátis que, à hora marcada, faz um pedido HTTP ao GitHub: “corre o workflow X”.

### O que cada job precisa

**URL** (exemplo diário PT):
```
https://api.github.com/repos/tiagosgama90-coder/video-bot/actions/workflows/diario.yml/dispatches
```

**Método:** POST

**Body:**
```json
{"ref":"main"}
```

**Headers (os 4 obrigatórios):**

| Header | Valor |
|--------|-------|
| Accept | application/vnd.github+json |
| Authorization | Bearer ghp_SEU_TOKEN_AQUI |
| X-GitHub-Api-Version | 2022-11-28 |
| Content-Type | application/json |

### Um token para todos

O **mesmo** token Bearer em **todos** os jobs (PT, US, segunda, quinta, VIP…).  
Não há token diferente para PT e US.

### Test run = dispara o vídeo

Quando fazes **Perform test run** e dá **204**, o GitHub **aceitou e o workflow COMEÇOU**.  
Não testes todos os jobs no mesmo dia senão geras vídeos a mais.

**Regra:** test run só para **confirmar** que o token funciona — 1 job chega (ex.: diário PT). Nos outros dias, o cron dispara sozinho.

### Lista de workflows (fim do URL)

| Job no cron-job.org | Ficheiro workflow |
|---------------------|-------------------|
| Diário PT | diario.yml |
| Diário US | diario-us.yml |
| Segunda motivacional PT | segunda.yml |
| Segunda motivacional US | segunda-us.yml |
| Quinta motivacional PT | quinta.yml |
| Quinta motivacional US | quinta-us.yml |
| Quarta VIP PT | quarta.yml |
| Quarta VIP US | quarta-us.yml |
| VIP divulgação PT | vip-divulgacao.yml |
| VIP divulgação US | vip-divulgacao-us.yml |

Base do URL:
```
https://api.github.com/repos/tiagosgama90-coder/video-bot/actions/workflows/
```

---

## 6. GitHub Actions

### Onde ver

https://github.com/tiagosgama90-coder/video-bot/actions

### O que procurar

| Cor | Significado |
|-----|-------------|
| Verde ✓ | Correu bem — vídeos gerados e enviados ao Buffer |
| Vermelho ✗ | Algo falhou — abre o job e lê o erro no fim |
| Amarelo | A correr — horóscopo demora ~1 hora |

### Disparar manualmente (sem cron-job.org)

1. Actions → escolhe workflow (ex. Horóscopo Diário SidusAstro)
2. **Run workflow** → branch `main` → Run

### Recuperação automática

Se alguém fizer push ao ficheiro `.github/triggers/disparar-diario-recuperacao`, dispara PT+US com forçar.

---

## 7. Secrets

**Onde:** https://github.com/tiagosgama90-coder/video-bot/settings/secrets/actions

**Não mexas** a menos que mudes password num serviço externo.

| Secret | Para quê |
|--------|----------|
| BUFFER_ACCESS_TOKEN | Publicar no Buffer |
| BUFFER_INSTAGRAM_CHANNEL_ID | Canal Instagram PT |
| BUFFER_TIKTOK_CHANNEL_ID | TikTok PT @sidusastro |
| BUFFER_TIKTOK_US_CHANNEL_ID | TikTok US @sidusastro_en |
| FIREBASE_ADMIN_JSON | Ler horóscopo do site |
| FIREBASE_STORAGE_BUCKET | Storage Firebase |
| AZURE_SPEECH_KEY | Voz dos vídeos |
| CLOUDINARY_CLOUD_NAME | Guardar vídeos |
| CLOUDINARY_API_KEY | Idem |
| CLOUDINARY_API_SECRET | Idem |

**O token do cron-job.org NÃO vai aqui.** Vai só no cron-job.org.

### Se regenerares uma key noutro sítio

| Serviço | Onde regenerar | Actualizar secret |
|---------|----------------|-------------------|
| Buffer | buffer.com/settings/api | BUFFER_ACCESS_TOKEN |
| Azure | portal.azure.com → Speech → Keys | AZURE_SPEECH_KEY |
| Cloudinary | console.cloudinary.com → API Keys | CLOUDINARY_* |
| Firebase | Firebase Console → Service accounts | FIREBASE_ADMIN_JSON |

---

## 8. Token do cron

### Criar / renovar (Classic — mais simples)

1. https://github.com/settings/tokens
2. **Generate new token (classic)**
3. Marcar só: **public_repo**
4. Expiration: **No expiration**
5. Copiar `ghp_...`
6. Colar em **todos** os jobs cron-job.org:
   ```
   Authorization: Bearer ghp_xxxx
   ```

### Códigos HTTP no test run

| Código | O que significa | O que fazer |
|--------|-----------------|-------------|
| **204** | Perfeito | Nada |
| **401** | Token inválido ou apagado | Criar token novo |
| **403** | Token sem permissão | Classic + public_repo |
| **404** | URL errado ou repo errado | Verificar `video-bot` no URL |

---

## 9. Como saber se está tudo OK

### Nível 1 — GitHub (2 min)

1. Abre Actions (link acima)
2. Os workflows do **dia de hoje** devem estar **verdes**:
   - Horóscopo Diário SidusAstro
   - Horóscopo Diário US

### Nível 2 — Buffer (2 min)

1. Entra no Buffer
2. Vê se há posts **agendados** ou **publicados** para hoje
3. TikTok PT, TikTok US, Instagram conforme configurado

### Nível 3 — cron-job.org (1 min)

1. Um job qualquer → **Perform test run** → **204**

### O que eu (ou um robot) **não** posso confirmar à distância

- Se o TikTok/Instagram **publicou** de facto (só o Buffer e tu vês isso)
- Se o texto do horóscopo no site estava correcto nesse dia

---

## 10. Quando algo falha

### Erro: "spending limit / payments failed" (4 segundos, vermelho)

**Causa:** Repo privado ou limite de minutos.  
**Solução:** Repo tem de estar **público**: Settings → Danger zone → Change visibility → Public.

### Erro: 401 no cron-job.org

**Causa:** Token expirou ou apagaste sem querer.  
**Solução:** Criar token classic novo (secção 8).

### Erro: 403 no cron-job.org

**Causa:** Token sem permissão.  
**Solução:** Token classic com **public_repo** marcado.

### Erro: "Can't resolve crypto" no render

**Causa:** Bug de código (já corrigido).  
**Solução:** Se voltar, é problema técnico no repo — precisas de developer ou Cursor.

### Erro: narração / Azure

**Causa:** AZURE_SPEECH_KEY errada ou limite Azure.  
**Solução:** Verificar key no portal Azure e secret no GitHub.

### Erro: Buffer

**Causa:** BUFFER_ACCESS_TOKEN revogado.  
**Solução:** Novo token no Buffer → actualizar secret.

### Vídeo não saiu hoje

1. Actions → workflow falhou? → lê o log
2. Se Actions verde mas Buffer vazio → problema Buffer/token
3. Se cron não disparou → cron-job.org → test run 204?
4. Disparar manual: Actions → Run workflow

---

## 11. O que NUNCA fazer

1. **Meter o repo privado** — voltas a ter limite de minutos e bloqueios
2. **Test run em todos os jobs no mesmo dia** — geras vídeos duplicados (segunda, quinta, VIP no dia errado)
3. **Correr `testar-token-cron.sh` todos os dias** — dispara os 10 workflows de uma vez
4. **Apagar secrets do GitHub** sem ter os valores novos
5. **Misturar API key do cron-job.org** com token GitHub no header Authorization

---

## 12. Scripts úteis

No repositório (pasta `scripts/`):

| Script | Para quê | Quando usar |
|--------|----------|-------------|
| `configurar-cron-externo.sh` | Cria/actualiza job PT no cron-job.org | Mudaste repo ou token |
| `configurar-cron-us.sh` | Idem para US | Idem |
| `configurar-cron-vip.sh` | Jobs VIP | Idem |
| `disparar-diario.sh` | Dispara diário PT manual | Emergência |
| `disparar-diario-us.sh` | Dispara diário US manual | Emergência |
| `testar-token-cron.sh` | Testa os 10 workflows com um PAT | **Só validação mensal** — cada um DISPARA um workflow |

### O que é o `testar-token-cron.sh`?

Serve para **testar se o teu token funciona em todos os workflows** de uma vez.

```bash
GITHUB_PAT=ghp_xxx ./scripts/testar-token-cron.sh
```

**Atenção:** Não é para usar todos os dias. Cada teste faz POST ao GitHub e **inicia** esse vídeo. Usa **1x por mês** para confirmar que o token ainda vale, ou quando mudas o token.

Para teste rápido diário: **1** Perform test run no cron-job.org (só 1 job) → 204.

---

## 13. Checklist mensal (5 minutos)

- [ ] cron-job.org → 1 job → Perform test run → **204**
- [ ] GitHub Actions → último diário PT e US → **verde**
- [ ] Buffer → posts agendados para a semana
- [ ] Repo ainda **público** (Settings → General)
- [ ] Token GitHub ainda existe (settings/tokens) e **No expiration**

---

## 14. FAQ

### Preciso do Cursor?

**Não** para o dia-a-dia. Só se quiseres mudar código (voz, design, textos, bugs).

### O código é público — alguém vê as passwords?

**Não.** Secrets ficam encriptados no GitHub. Só tu vês os nomes (BUFFER_ACCESS_TOKEN, etc.), nunca os valores.

### Posso mudar horários?

Sim, mas é no código (`config/`, workflows, Buffer slots). Precisas de developer ou Cursor.

### Quantos vídeos por dia?

- Normal: **3 horóscopos** PT + **3** US
- Terça/sábado: **2** horóscopos + **1** afiliados (cada locale)
- + especiais nos dias certos (segunda, quarta, quinta, VIP)

### Como forço vídeos de hoje outra vez?

Actions → Horóscopo Diário → Run workflow → marcar **forcar** se existir, ou usar recuperação.

---

## Links rápidos

| O quê | URL |
|-------|-----|
| Repo | https://github.com/tiagosgama90-coder/video-bot |
| Actions | https://github.com/tiagosgama90-coder/video-bot/actions |
| Secrets | https://github.com/tiagosgama90-coder/video-bot/settings/secrets/actions |
| Tokens GitHub | https://github.com/tiagosgama90-coder/video-bot/settings/tokens?type=beta |
| cron-job.org | https://console.cron-job.org |
| Buffer | https://buffer.com |

---

*Guia criado para administração autónoma do SidusAstro Video Bot. Guarda este ficheiro no teu PC/Google Drive — não está no repositório público.*
