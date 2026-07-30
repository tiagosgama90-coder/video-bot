#!/usr/bin/env bash
# Configura cron-job.org para disparar o workflow US às 07:30 America/New_York.
# Horóscopo EN → bot US → Buffer publica 09:00/13:30/19:00 NY.
set -euo pipefail

REPO_OWNER="${GITHUB_REPO_OWNER:-tiagosgama90-coder}"
REPO_NAME="${GITHUB_REPO_NAME:-video-bot}"
WORKFLOW_FILE="${WORKFLOW_FILE:-diario-us.yml}"
# ID numérico estável (evita 404 se o nome do ficheiro mudar)
WORKFLOW_ID="${WORKFLOW_ID:-313950729}"
BRANCH="${GITHUB_REF_NAME:-main}"
CRON_API="https://api.cron-job.org"
JOB_TITLE="SidusAstro Horóscopo Diário US"
SCHEDULE_HOUR=7
SCHEDULE_MINUTE=30
TIMEZONE="America/New_York"

GITHUB_DISPATCH_URL="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_ID}/dispatches"

echo "══════════════════════════════════════════════════════════"
echo "  SidusAstro US — Cron @sidusastro_en (cron-job.org)"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "Horário: ${SCHEDULE_HOUR}:$(printf '%02d' ${SCHEDULE_MINUTE}) ${TIMEZONE}"
echo "Workflow: ${WORKFLOW_FILE}"
echo "Repo:     ${REPO_OWNER}/${REPO_NAME}"
echo ""

if [[ -z "${GITHUB_PAT:-}" ]]; then
  echo "1) Usa o MESMO GITHUB_PAT que já tens para o cron PT"
  echo "   https://github.com/settings/tokens?type=beta"
  echo "   Permissões: Repository → ${REPO_NAME} → Actions: Read and write"
  echo ""
  read -rsp "   Cola o GITHUB_PAT aqui: " GITHUB_PAT
  echo ""
  echo ""
fi

if [[ -z "${CRONJOB_API_KEY:-}" ]]; then
  echo "2) Usa a MESMA API key do cron-job.org (conta que já tens)"
  echo "   https://console.cron-job.org/settings → API key"
  echo ""
  read -rsp "   Cola o CRONJOB_API_KEY aqui: " CRONJOB_API_KEY
  echo ""
  echo ""
fi

if [[ -z "$GITHUB_PAT" || -z "$CRONJOB_API_KEY" ]]; then
  echo "❌ GITHUB_PAT e CRONJOB_API_KEY são obrigatórios."
  exit 1
fi

echo "🔍 A validar GITHUB_PAT (dispara teste US)..."
HTTP_CODE=$(curl -sS -o /tmp/validar-pat-us.json -w "%{http_code}" \
  -X POST "$GITHUB_DISPATCH_URL" \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_PAT}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d "{\"ref\":\"${BRANCH}\"}")

if [[ "$HTTP_CODE" != "204" ]]; then
  echo "❌ GITHUB_PAT inválido ou sem permissão (HTTP ${HTTP_CODE}):"
  cat /tmp/validar-pat-us.json
  echo ""
  if [[ "$HTTP_CODE" == "404" ]]; then
    echo "   HTTP 404 no cron-job.org = token expirado ou sem acesso ao repo ${REPO_NAME}."
    echo "   Cria token novo: https://github.com/settings/tokens?type=beta"
    echo "   → Repository: ${REPO_NAME} → Actions: Read and write"
  fi
  exit 1
fi
echo "✅ GITHUB_PAT válido — workflow US de teste disparado."
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

print("🔍 A procurar job US existente no cron-job.org...", flush=True)
jobs = api_request("GET", "/jobs")
existing_id = None
for job in jobs.get("jobs", []):
    title = (job.get("title") or "").lower()
    if title == job_title.lower() or "horóscopo diário us" in title or "cronjob americano" in title:
        existing_id = job.get("jobId")
        print(f"   Encontrado: {job.get('title')} (ID {existing_id})", flush=True)
        break

if existing_id:
    print(f"♻️  Job existente encontrado (ID {existing_id}) — a actualizar...", flush=True)
    api_request("PATCH", f"/jobs/{existing_id}", job_body)
    job_id = existing_id
else:
    print("➕ A criar novo job US no cron-job.org...", flush=True)
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
echo "✅ Cron US configurado!"
echo ""
echo "   Job ID:     ${JOB_ID}"
echo "   Horário:    07:30 America/New_York (todos os dias)"
echo "   Workflow:   ${WORKFLOW_FILE} (ID ${WORKFLOW_ID}) → @sidusastro_en"
echo "   Console:    https://console.cron-job.org/jobs/${JOB_ID}"
echo ""
echo "   Mantém o cron PT separado (07:15 Lisboa → diario.yml)."
echo "══════════════════════════════════════════════════════════"
