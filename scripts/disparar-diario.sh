#!/usr/bin/env bash
# Dispara manualmente o workflow diário (mesmo endpoint que o cron-job.org usa).
set -euo pipefail

REPO_OWNER="${GITHUB_REPO_OWNER:-tiagosgama90-coder}"
REPO_NAME="${GITHUB_REPO_NAME:-video-bot}"
WORKFLOW_FILE="${GITHUB_WORKFLOW_FILE:-diario.yml}"
BRANCH="${GITHUB_REF_NAME:-main}"

if [[ -z "${GITHUB_PAT:-}" ]]; then
  echo "❌ Define GITHUB_PAT (Personal Access Token com permissão actions:write)."
  echo "   Exemplo: GITHUB_PAT=ghp_xxx ./scripts/disparar-diario.sh"
  exit 1
fi

URL="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/dispatches"

echo "🚀 A disparar workflow ${WORKFLOW_FILE} em ${REPO_OWNER}/${REPO_NAME} (ref: ${BRANCH})..."

HTTP_CODE=$(curl -sS -o /tmp/disparar-diario-response.json -w "%{http_code}" \
  -X POST "$URL" \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_PAT}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d "{\"ref\":\"${BRANCH}\"}")

if [[ "$HTTP_CODE" == "204" ]]; then
  echo "✅ Workflow disparado com sucesso."
  echo "   Ver progresso: https://github.com/${REPO_OWNER}/${REPO_NAME}/actions"
  exit 0
fi

echo "❌ Falha ao disparar (HTTP ${HTTP_CODE}):"
cat /tmp/disparar-diario-response.json
echo ""
exit 1
