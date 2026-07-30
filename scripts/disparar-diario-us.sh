#!/usr/bin/env bash
# Dispara manualmente o workflow diário US (mesmo endpoint que o cron-job.org US).
set -euo pipefail

REPO_OWNER="${GITHUB_REPO_OWNER:-tiagosgama90-coder}"
REPO_NAME="${GITHUB_REPO_NAME:-video-bot}"
WORKFLOW_FILE="${WORKFLOW_FILE:-diario-us.yml}"
BRANCH="${GITHUB_REF_NAME:-main}"

if [[ -z "${GITHUB_PAT:-}" ]]; then
  echo "❌ Define GITHUB_PAT (mesmo token do cron PT)."
  exit 1
fi

URL="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/dispatches"

echo "🚀 A disparar workflow US ${WORKFLOW_FILE}..."

HTTP_CODE=$(curl -sS -o /tmp/disparar-diario-us-response.json -w "%{http_code}" \
  -X POST "$URL" \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_PAT}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d "{\"ref\":\"${BRANCH}\"}")

if [[ "$HTTP_CODE" == "204" ]]; then
  echo "✅ Workflow US disparado."
  echo "   https://github.com/${REPO_OWNER}/${REPO_NAME}/actions"
  exit 0
fi

echo "❌ Falha (HTTP ${HTTP_CODE}):"
cat /tmp/disparar-diario-us-response.json
exit 1
