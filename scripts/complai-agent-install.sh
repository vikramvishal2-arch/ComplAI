#!/usr/bin/env bash
set -euo pipefail

API_URL=""
TOKEN=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --api-url) API_URL="$2"; shift 2 ;;
    --token) TOKEN="$2"; shift 2 ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
done

if [[ -z "$API_URL" || -z "$TOKEN" ]]; then
  echo "Usage: $0 --api-url <url> --token <enrollment-token>"
  exit 1
fi

HOSTNAME="$(hostname)"
PLATFORM="$(uname -s | tr '[:upper:]' '[:lower:]')"

BODY=$(cat <<EOF
{"enrollmentToken":"$TOKEN","hostname":"$HOSTNAME","platform":"$PLATFORM","agentVersion":"0.1.0"}
EOF
)

RESPONSE=$(curl -fsSL -X POST "${API_URL%/}/api/agents/enroll" \
  -H 'Content-Type: application/json' \
  -d "$BODY")

AGENT_DIR="${HOME}/.complai/agent"
mkdir -p "$AGENT_DIR"

echo "$RESPONSE" > "${AGENT_DIR}/enrollment-response.json"

AGENT_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['agentId'])" 2>/dev/null || echo "$RESPONSE" | sed -n 's/.*"agentId":"\([^"]*\)".*/\1/p')
AGENT_SECRET=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['agentSecret'])" 2>/dev/null || echo "$RESPONSE" | sed -n 's/.*"agentSecret":"\([^"]*\)".*/\1/p')

cat > "${AGENT_DIR}/agent.credentials.json" <<EOF
{
  "agentId": "$AGENT_ID",
  "agentSecret": "$AGENT_SECRET",
  "apiUrl": "${API_URL%/}",
  "enrolledAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo "ComplAI agent enrolled: $AGENT_ID"
echo "Credentials saved to ${AGENT_DIR}/agent.credentials.json"
