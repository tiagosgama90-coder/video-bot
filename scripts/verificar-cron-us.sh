#!/usr/bin/env bash
# Testa o PAT e o endpoint de dispatch do workflow US (mesmo pedido que o cron-job.org).
set -euo pipefail

REPO_OWNER="${GITHUB_REPO_OWNER:-tiagosgama90-coder}"
REPO_NAME="${GITHUB_REPO_NAME:-video-bot}"
WORKFLOW_ID="${WORKFLOW_ID:-313950729}"
BRANCH="${GITHUB_REF_NAME:-main}"

URL="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_ID}/dispatches"

if [[ -z "${GITHUB_PAT:-}" ]]; then
  echo "❌ Define GITHUB_PAT (token com Actions: Read and write no repo ${REPO_NAME})."
  echo ""
  echo "   Cria em: https://github.com/settings/tokens?type=beta"
  echo "   Permissões: Repository → ${REPO_NAME} → Actions: Read and write"
  exit 1
fi

echo "🔍 A testar dispatch US..."
echo "   URL: ${URL}"
echo "   Branch: ${BRANCH}"
echo ""

HTTP_CODE=$(curl -sS -o /tmp/verificar-cron-us.json -w "%{http_code}" \
  -X POST "$URL" \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_PAT}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -H "Content-Type: application/json" \
  -d "{\"ref\":\"${BRANCH}\"}")

case "$HTTP_CODE" in
  204)
    echo "✅ Sucesso (HTTP 204) — workflow diario-us.yml disparado."
    echo "   https://github.com/${REPO_OWNER}/${REPO_NAME}/actions"
    ;;
  404)
    echo "❌ HTTP 404 — quase sempre PAT inválido/expirado ou sem acesso ao repo."
    echo "   O GitHub devolve 404 em vez de 403 quando o token não vê o repositório."
    cat /tmp/verificar-cron-us.json
    echo ""
    echo "   Corrige:"
    echo "   1. Cria NOVO token em https://github.com/settings/tokens?type=beta"
    echo "   2. Repository access: Only ${REPO_NAME}"
    echo "   3. Permissions → Actions: Read and write"
    echo "   4. Cola o token novo no cron-job.org → Headers → Authorization: Bearer <token>"
    exit 1
    ;;
  401)
    echo "❌ HTTP 401 — token inválido ou revogado."
    cat /tmp/verificar-cron-us.json
    exit 1
    ;;
  403)
    echo "❌ HTTP 403 — token sem permissão actions:write."
    cat /tmp/verificar-cron-us.json
    exit 1
    ;;
  *)
    echo "❌ HTTP ${HTTP_CODE}:"
    cat /tmp/verificar-cron-us.json
    exit 1
    ;;
esac
