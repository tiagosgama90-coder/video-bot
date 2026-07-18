#!/usr/bin/env bash
# Configura TODOS os crons cron-job.org (PT + US, diário + especiais).
# Horário: 07:30 no fuso local. O bot espera até 30 min pelo siteDaily no Firebase.
set -euo pipefail

REPO_OWNER="${GITHUB_REPO_OWNER:-tiagosgama90-coder}"
REPO_NAME="${GITHUB_REPO_NAME:-sidusastro-video-bot}"
BRANCH="${GITHUB_REF_NAME:-main}"
CRON_API="https://api.cron-job.org"
SCHEDULE_HOUR=7
SCHEDULE_MINUTE=30

GITHUB_DISPATCH_BASE="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows"

echo "══════════════════════════════════════════════════════════"
echo "  SidusAstro — Configurar TODOS os crons (cron-job.org)"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "Repo:     ${REPO_OWNER}/${REPO_NAME}"
echo "Horário:  ${SCHEDULE_HOUR}:$(printf '%02d' ${SCHEDULE_MINUTE}) (fuso local por job)"
echo "Expressão cron equivalente: ${SCHEDULE_MINUTE} ${SCHEDULE_HOUR} * * *"
echo ""

if [[ -z "${GITHUB_PAT:-}" ]]; then
  echo "1) GITHUB_PAT (mesmo token nos 8 jobs):"
  echo "   https://github.com/settings/tokens?type=beta"
  echo "   Permissões: Repository → ${REPO_NAME} → Actions: Read and write"
  echo ""
  read -rsp "   Cola o GITHUB_PAT: " GITHUB_PAT
  echo ""
  echo ""
fi

if [[ -z "${CRONJOB_API_KEY:-}" ]]; then
  echo "2) CRONJOB_API_KEY:"
  echo "   https://console.cron-job.org/settings → API key"
  echo ""
  read -rsp "   Cola o CRONJOB_API_KEY: " CRONJOB_API_KEY
  echo ""
  echo ""
fi

if [[ -z "$GITHUB_PAT" || -z "$CRONJOB_API_KEY" ]]; then
  echo "❌ GITHUB_PAT e CRONJOB_API_KEY são obrigatórios."
  exit 1
fi

echo "🔍 A validar GITHUB_PAT (dispara teste diario.yml)..."
TEST_URL="${GITHUB_DISPATCH_BASE}/diario.yml/dispatches"
HTTP_CODE=$(curl -sS -o /tmp/validar-pat-todos.json -w "%{http_code}" \
  -X POST "$TEST_URL" \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_PAT}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d "{\"ref\":\"${BRANCH}\"}")

if [[ "$HTTP_CODE" != "204" ]]; then
  echo "❌ GITHUB_PAT inválido (HTTP ${HTTP_CODE}):"
  cat /tmp/validar-pat-todos.json
  exit 1
fi
echo "✅ GITHUB_PAT válido."
echo ""

export GITHUB_PAT CRONJOB_API_KEY BRANCH CRON_API SCHEDULE_HOUR SCHEDULE_MINUTE
export GITHUB_DISPATCH_BASE

RESULT=$(python3 <<'PY'
import json
import os
import urllib.request

cron_api = os.environ["CRON_API"]
api_key = os.environ["CRONJOB_API_KEY"]
pat = os.environ["GITHUB_PAT"]
branch = os.environ["BRANCH"]
dispatch_base = os.environ["GITHUB_DISPATCH_BASE"]
hour = int(os.environ["SCHEDULE_HOUR"])
minute = int(os.environ["SCHEDULE_MINUTE"])

# wdays: 0=domingo … 6=sábado; [-1]=todos os dias (API cron-job.org)
JOBS = [
    ("SidusAstro Horóscopo Diário", "diario.yml", "Europe/Lisbon", [-1]),
    ("SidusAstro Horóscopo Diário US", "diario-us.yml", "America/New_York", [-1]),
    ("SidusAstro Segunda Motivacional", "segunda.yml", "Europe/Lisbon", [1]),
    ("SidusAstro Quarta Afiliados", "quarta.yml", "Europe/Lisbon", [3]),
    ("SidusAstro Quinta Motivacional", "quinta.yml", "Europe/Lisbon", [4]),
    ("SidusAstro Segunda Motivacional US", "segunda-us.yml", "America/New_York", [1]),
    ("SidusAstro Quarta Afiliados US", "quarta-us.yml", "America/New_York", [3]),
    ("SidusAstro Quinta Motivacional US", "quinta-us.yml", "America/New_York", [4]),
]


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


def upsert_job(title, workflow, timezone, wdays):
    dispatch_url = f"{dispatch_base}/{workflow}/dispatches"
    job_body = {
        "job": {
            "title": title,
            "url": dispatch_url,
            "enabled": True,
            "saveResponses": True,
            "requestMethod": 1,
            "requestTimeout": 30,
            "schedule": {
                "timezone": timezone,
                "expiresAt": 0,
                "hours": [hour],
                "minutes": [minute],
                "mdays": [-1],
                "months": [-1],
                "wdays": wdays,
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
        (job.get("jobId") for job in jobs.get("jobs", []) if job.get("title") == title),
        None,
    )

    if existing_id:
        api_request("PATCH", f"/jobs/{existing_id}", job_body)
        action = "actualizado"
        job_id = existing_id
    else:
        created = api_request("PUT", "/jobs", job_body)
        job_id = created.get("jobId")
        action = "criado"

    wdays_label = "todos os dias" if wdays == [-1] else f"wdays={wdays}"
    return {
        "title": title,
        "workflow": workflow,
        "timezone": timezone,
        "wdays": wdays_label,
        "jobId": job_id,
        "action": action,
    }


results = []
for title, workflow, tz, wdays in JOBS:
    print(f"⚙️  {title}...", flush=True)
    results.append(upsert_job(title, workflow, tz, wdays))

print(json.dumps({"jobs": results}))
PY
)

echo "$RESULT" | python3 <<'PY'
import json
import sys

lines = [l for l in sys.stdin.read().splitlines() if l.strip().startswith("{")]
data = json.loads(lines[-1])
jobs = data["jobs"]

print("")
print("══════════════════════════════════════════════════════════")
print("✅ Todos os crons configurados!")
print("")
for job in jobs:
    print(f"   [{job['action']}] {job['title']}")
    print(f"            {job['workflow']} | {job['timezone']} | {job['wdays']}")
    print(f"            https://console.cron-job.org/jobs/{job['jobId']}")
    print("")
print("   Actions: https://github.com/tiagosgama90-coder/sidusastro-video-bot/actions")
print("══════════════════════════════════════════════════════════")
PY
