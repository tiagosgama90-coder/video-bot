#!/usr/bin/env bash
# Configura cron-job.org para disparar o workflow diário às 07:30 Lisboa.
# Site atualiza horóscopo ~07:00 → bot arranca 07:30 (espera até 30 min pelo Firebase) → Buffer 09:00/10:30/12:00.
set -euo pipefail

REPO_OWNER="${GITHUB_REPO_OWNER:-tiagosgama90-coder}"
REPO_NAME="${GITHUB_REPO_NAME:-sidusastro-video-bot}"
WORKFLOW_FILE="${GITHUB_WORKFLOW_FILE:-diario.yml}"
BRANCH="${GITHUB_REF_NAME:-main}"
CRON_API="https://api.cron-job.org"
JOB_TITLE="SidusAstro Horóscopo Diário"
SCHEDULE_HOUR=7
SCHEDULE_MINUTE=30
TIMEZONE="Europe/Lisbon"

GITHUB_DISPATCH_URL="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/dispatches"

echo "══════════════════════════════════════════════════════════"
echo "  SidusAstro — Configurar disparo diário (cron-job.org)"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "Horário: ${SCHEDULE_HOUR}:$(printf '%02d' ${SCHEDULE_MINUTE}) ${TIMEZONE}"
echo "Repo:    ${REPO_OWNER}/${REPO_NAME}"
echo ""

if [[ -z "${GITHUB_PAT:-}" ]]; then
  echo "1) Cria um Personal Access Token no GitHub:"
  echo "   https://github.com/settings/tokens?type=beta"
  echo "   Permissões: Repository → ${REPO_NAME} → Actions: Read and write"
  echo ""
  read -rsp "   Cola o GITHUB_PAT aqui: " GITHUB_PAT
  echo ""
  echo ""
fi

if [[ -z "${CRONJOB_API_KEY:-}" ]]; then
  echo "2) Obtém a API key no cron-job.org:"
  echo "   https://console.cron-job.org/settings → API key"
  echo "   (Conta gratuita chega; regista-te se ainda não tens)"
  echo ""
  read -rsp "   Cola o CRONJOB_API_KEY aqui: " CRONJOB_API_KEY
  echo ""
  echo ""
fi

if [[ -z "$GITHUB_PAT" || -z "$CRONJOB_API_KEY" ]]; then
  echo "❌ GITHUB_PAT e CRONJOB_API_KEY são obrigatórios."
  exit 1
fi

echo "🔍 A validar GITHUB_PAT..."
HTTP_CODE=$(curl -sS -o /tmp/validar-pat.json -w "%{http_code}" \
  -X POST "$GITHUB_DISPATCH_URL" \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_PAT}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d "{\"ref\":\"${BRANCH}\"}")

if [[ "$HTTP_CODE" != "204" ]]; then
  echo "❌ GITHUB_PAT inválido ou sem permissão actions:write (HTTP ${HTTP_CODE}):"
  cat /tmp/validar-pat.json
  echo ""
  exit 1
fi
echo "✅ GITHUB_PAT válido — workflow de teste disparado (recupera o dia de hoje)."
echo ""

export GITHUB_PAT CRONJOB_API_KEY JOB_TITLE GITHUB_DISPATCH_URL BRANCH
export SCHEDULE_HOUR SCHEDULE_MINUTE TIMEZONE CRON_API

RESULT=$(python3 <<'PY'
import json
import os
import urllib.request

cron_api = os.environ["CRON_API"]
api_key = os.environ["CRONJOB_API_KEY"]
job_title = os.environ["JOB_TITLE"]
dispatch_url = os.environ["GITHUB_DISPATCH_URL"]
branch = os.environ["BRANCH"]
pat = os.environ["GITHUB_PAT"]
tz = os.environ["TIMEZONE"]
hour = int(os.environ["SCHEDULE_HOUR"])
minute = int(os.environ["SCHEDULE_MINUTE"])

def api_request(method, path, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        cron_api + path,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req) as resp:
        body = resp.read().decode()
        return json.loads(body) if body else {}

job_body = {
    "job": {
        "title": job_title,
        "url": dispatch_url,
        "enabled": True,
        "saveResponses": True,
        "requestMethod": 1,
        "requestTimeout": 30,
        "schedule": {
            "timezone": tz,
            "expiresAt": 0,
            "hours": [hour],
            "minutes": [minute],
            "mdays": [-1],
            "months": [-1],
            "wdays": [-1],
        },
        "extendedData": {
            "headers": {
                "Accept": "application/vnd.github+json",
                "Authorization": f"Bearer {pat}",
                "X-GitHub-Api-Version": "2022-11-28",
                "Content-Type": "application/json",
            },
            "body": json.dumps({"ref": branch}),
        },
    }
}

print("🔍 A procurar job existente no cron-job.org...", flush=True)
jobs = api_request("GET", "/jobs")
existing_id = next(
    (job.get("jobId") for job in jobs.get("jobs", []) if job.get("title") == job_title),
    None,
)

if existing_id:
    print(f"♻️  Job existente encontrado (ID {existing_id}) — a actualizar...", flush=True)
    api_request("PATCH", f"/jobs/{existing_id}", job_body)
    job_id = existing_id
else:
    print("➕ A criar novo job no cron-job.org...", flush=True)
    created = api_request("PUT", "/jobs", job_body)
    job_id = created.get("jobId")

print(json.dumps({"jobId": job_id}))
PY
)

JOB_ID=$(echo "$RESULT" | python3 -c "import json,sys; lines=[l for l in sys.stdin if not l.startswith(('🔍','♻️','➕'))]; print(json.loads(lines[-1]).get('jobId',''))")

if [[ -z "$JOB_ID" ]]; then
  echo "❌ Falha ao configurar cron-job.org:"
  echo "$RESULT"
  exit 1
fi

echo ""
echo "══════════════════════════════════════════════════════════"
echo "✅ Configuração concluída!"
echo ""
echo "   Job ID:     ${JOB_ID}"
echo "   Horário:    ${SCHEDULE_HOUR}:$(printf '%02d' ${SCHEDULE_MINUTE}) ${TIMEZONE} (todos os dias)"
echo "   Console:    https://console.cron-job.org/jobs/${JOB_ID}"
echo "   Actions:    https://github.com/${REPO_OWNER}/${REPO_NAME}/actions"
echo ""
echo "   O workflow de hoje já foi disparado no teste de validação."
echo "   Amanhã às 07:30 o cron-job.org dispara automaticamente."
echo "══════════════════════════════════════════════════════════"
