#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${BASE_URL:-}"
if [[ -z "$BASE_URL" ]]; then
  echo "BASE_URL is not set. Aborting smoke tests."
  exit 1
fi
echo "Smoke tests against: ${BASE_URL}"

# 1) Admin login
LOGIN=$(curl -sS -X POST "$BASE_URL/api/auth/admin" \
  -H "Content-Type: application/json" \
  -d '{"email":"schmittnatascha92@yahoo.de","password":"changeme123"}')
TOKEN=$(echo "$LOGIN" | python3 - << 'PY'
import sys, json
try:
  d = json.load(sys.stdin)
  print(d.get('token',''))
except Exception:
  print('')
PY
)
if [[ -z "$TOKEN" || "$TOKEN" == "" ]]; then
  echo "Admin login failed. Response: $LOGIN"
  exit 1
fi
echo "Admin login success. Token: $TOKEN"

# 2) Create guest
GUEST=$(curl -sS -X POST "$BASE_URL/api/admin/guests" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"CI Guest","email":"ci-guest@example.test"}')
CODE=$(echo "$GUEST" | python3 -c 'import sys, json; d=json.load(sys.stdin); g=d.get("guest", {}); print(g.get("code", ""))')
if [[ -z "$CODE" || "$CODE" == "" ]]; then
  echo "Guest creation failed. Response: $GUEST"
  exit 1
fi
echo "Guest created with code: $CODE"

# 3) Magic-link generation
MAGIC=$(curl -sS "$BASE_URL/api/guest/magic-link?code=$CODE")
echo "Magic-link response: $MAGIC"

# Smoke complete
echo "SMOKE OK"
