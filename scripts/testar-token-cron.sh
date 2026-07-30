#!/usr/bin/env bash
# Testa o PAT do cron-job.org em todos os workflows principais.
# Uso: GITHUB_PAT=ghp_xxx ./scripts/testar-token-cron.sh
set -euo pipefail

REPO_OWNER="${GITHUB_REPO_OWNER:-tiagosgama90-coder}"
REPO_NAME="${GITHUB_REPO_NAME:-video-bot}"
BRANCH="${GITHUB_REF_NAME:-main}"

if [[ -z "${GITHUB_PAT:-}" ]]; then
  echo "❌ Define GITHUB_PAT (mesmo token do cron-job.org)."
  echo "   Exemplo: GITHUB_PAT=ghp_xxx ./scripts/testar-token-cron.sh"
  exit 1
fi

WORKFLOWS=(
  "diario.yml|Diário PT"
  "diario-us.yml|Diário US"
  "vip-divulgacao.yml|VIP divulgação PT"
  "vip-divulgacao-us.yml|VIP divulgação US"
)

BASE="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows"
OK=0
FAIL=0

echo "🔍 A testar ${#WORKFLOWS[@]} workflows em ${REPO_OWNER}/${REPO_NAME}..."
echo ""

for entry in "${WORKFLOWS[@]}"; do
  file="${entry%%|*}"
  label="${entry##*|}"
  url="${BASE}/${file}/dispatches"
  code=$(curl -sS -o /tmp/cron-test.json -w "%{http_code}" \
    -X POST "$url" \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GITHUB_PAT}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -H "Content-Type: application/json" \
    -d "{\"ref\":\"${BRANCH}\"}")
  if [[ "$code" == "204" ]]; then
    echo "✅ ${label} (${file}) — HTTP 204"
    OK=$((OK + 1))
  else
    echo "❌ ${label} (${file}) — HTTP ${code}"
    cat /tmp/cron-test.json
    echo ""
    FAIL=$((FAIL + 1))
  fi
done

echo ""
echo "Resultado: ${OK} OK, ${FAIL} falhas"
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
echo "✅ Token válido para todos os workflows."
