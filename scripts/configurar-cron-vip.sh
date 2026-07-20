#!/usr/bin/env bash
# Configura cron-job.org para VIP divulgação: segundas, quartas, sextas e domingos.
# PT: 07:15 Lisboa → vip-divulgacao.yml
# US: 07:30 New York → vip-divulgacao-us.yml
#
# Uso:
#   LOCALE=pt GITHUB_PAT=... CRONJOB_API_KEY=... bash scripts/configurar-cron-vip.sh
#   LOCALE=us GITHUB_PAT=... CRONJOB_API_KEY=... bash scripts/configurar-cron-vip.sh
set -euo pipefail

LOCALE="${LOCALE:-pt}"
REPO_OWNER="${GITHUB_REPO_OWNER:-tiagosgama90-coder}"
REPO_NAME="${GITHUB_REPO_NAME:-sidusastro-video-bot}"
BRANCH="${GITHUB_REF_NAME:-main}"
CRON_API="https://api.cron-job.org"

if [[ "$LOCALE" == "us" ]]; then
  WORKFLOW_FILE="vip-divulgacao-us.yml"
  JOB_TITLE="SidusAstro VIP Divulgação US"
  SCHEDULE_HOUR=7
  SCHEDULE_MINUTE=30
  TIMEZONE="America/New_York"
else
  WORKFLOW_FILE="vip-divulgacao.yml"
  JOB_TITLE="SidusAstro VIP Divulgação PT"
  SCHEDULE_HOUR=7
  SCHEDULE_MINUTE=15
  TIMEZONE="Europe/Lisbon"
fi

GITHUB_DISPATCH_URL="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/dispatches"

echo "══════════════════════════════════════════════════════════"
echo "  VIP Divulgação — ${LOCALE^^} (seg · qua · sex · dom)"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "Horário: ${SCHEDULE_HOUR}:$(printf '%02d' ${SCHEDULE_MINUTE}) ${TIMEZONE}"
echo "Workflow: ${WORKFLOW_FILE}"
echo ""

if [[ -z "${GITHUB_PAT:-}" ]]; then
  read -rsp "GITHUB_PAT: " GITHUB_PAT
  echo ""
fi
if [[ -z "${CRONJOB_API_KEY:-}" ]]; then
  read -rsp "CRONJOB_API_KEY: " CRONJOB_API_KEY
  echo ""
fi

HTTP_CODE=$(curl -sS -o /tmp/validar-vip-cron.json -w "%{http_code}" \
  -X POST "$GITHUB_DISPATCH_URL" \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_PAT}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d "{\"ref\":\"${BRANCH}\"}")

if [[ "$HTTP_CODE" != "204" ]]; then
  echo "❌ GITHUB_PAT inválido (HTTP ${HTTP_CODE}):"
  cat /tmp/validar-vip-cron.json
  exit 1
fi
echo "✅ GITHUB_PAT válido — workflow de teste disparado."
echo ""

export GITHUB_PAT CRONJOB_API_KEY JOB_TITLE GITHUB_DISPATCH_URL BRANCH
export SCHEDULE_HOUR SCHEDULE_MINUTE TIMEZONE CRON_API

python3 <<'PY'
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

# cron-job.org: 0=domingo, 1=segunda, 3=quarta, 5=sexta
WDAYS_VIP = [0, 1, 3, 5]

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
            "wdays": WDAYS_VIP,
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

jobs = api_request("GET", "/jobs")
existing_id = next(
    (job.get("jobId") for job in jobs.get("jobs", []) if job.get("title") == job_title),
    None,
)

if existing_id:
    print(f"♻️  Job existente (ID {existing_id}) — a actualizar...")
    api_request("PATCH", f"/jobs/{existing_id}", job_body)
    job_id = existing_id
else:
    print("➕ A criar job VIP no cron-job.org...")
    created = api_request("PUT", "/jobs", job_body)
    job_id = created.get("jobId")

print("")
print("✅ VIP divulgação configurado!")
print(f"   Job ID:     {job_id}")
print(f"   Dias:       domingo, segunda, quarta, sexta")
print(f"   Horário:    {hour:02d}:{minute:02d} {tz}")
print(f"   Console:    https://console.cron-job.org/jobs/{job_id}")
print("")
print("💡 Desactiva os crons antigos de segunda/quarta motivacional se ainda existirem.")
PY
