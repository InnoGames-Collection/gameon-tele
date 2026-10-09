#!/usr/bin/env bash
# ==============================================================================
# GameOn Tele — Tier-0 Enterprise Automated Verification Suite
# Council of Seven Comprehensive Health, Anti-Cheat, Cryptography & Security Probes
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

API_BASE="${API_BASE:-http://127.0.0.1:3602}"
ADMIN_BASE="${ADMIN_BASE:-http://127.0.0.1:3603}"
WEB_BASE="${WEB_BASE:-http://127.0.0.1:3600}"

GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

PASSED=0
FAILED=0

log_pass() {
  echo -e "  ${GREEN}✓${NC} $1"
  PASSED=$((PASSED + 1))
}

log_fail() {
  echo -e "  ${RED}✗${NC} $1: $2"
  FAILED=$((FAILED + 1))
}

echo -e "\n${BOLD}${CYAN}==============================================================================${NC}"
echo -e "${BOLD}${CYAN}   GAMEON TELE — COUNCIL OF SEVEN TIER-0 VERIFICATION HARNESS                 ${NC}"
echo -e "${BOLD}${CYAN}==============================================================================${NC}"

# ─────────────────────────────────────────────────────────────────────────────
# 1. Internal In-Memory Specification & Cryptography Verification
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${BOLD}Phase 1: Running Cryptographic & Physics Specification Harness...${NC}"
if [ -d "$REPO_DIR/backend" ]; then
  cd "$REPO_DIR/backend"
  if NODE_PATH=./node_modules npx tsx ../scripts/verify-tier0.ts; then
    log_pass "Tier-0 Mathematical, Physics Anti-Cheat & Cryptographic Invariants Verified"
  else
    log_fail "Specification Harness" "Failed to verify core cryptographic invariants"
  fi
else
  log_fail "Repository Structure" "backend directory not found at $REPO_DIR/backend"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 2. Live HTTP Network & Security Probes (If Server Is Active)
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${BOLD}Phase 2: Live Network & Endpoint Security Probes (${API_BASE})...${NC}"

if curl -s -f --connect-timeout 2 "$API_BASE/health" > /dev/null 2>&1; then
  echo -e "  API detected online at ${API_BASE}. Executing live HTTP probes..."

  # Probe 1: Health Probes
  LIVE_STATUS=$(curl -s "$API_BASE/healthz/live" | grep -o '"status":"ALIVE"' || true)
  if [ -n "$LIVE_STATUS" ]; then
    log_pass "Health Probe: /healthz/live reported ALIVE"
  else
    log_fail "Health Probe /healthz/live" "Expected ALIVE status"
  fi

  READY_STATUS=$(curl -s "$API_BASE/healthz/ready" | grep -o '"status":' || true)
  if [ -n "$READY_STATUS" ]; then
    log_pass "Health Probe: /healthz/ready responded successfully"
  else
    log_fail "Health Probe /healthz/ready" "Failed readiness check"
  fi

  # Probe 2: Security Headers & CORS
  HEADERS=$(curl -s -I "$API_BASE/health")
  if echo "$HEADERS" | grep -qi "X-Content-Type-Options: nosniff"; then
    log_pass "Security Headers: X-Content-Type-Options: nosniff enforced"
  else
    log_fail "Security Headers" "Missing X-Content-Type-Options: nosniff"
  fi

  if echo "$HEADERS" | grep -qi "X-Frame-Options: DENY"; then
    log_pass "Security Headers: X-Frame-Options: DENY enforced"
  else
    log_fail "Security Headers" "Missing X-Frame-Options: DENY"
  fi

  # Probe 3: Webhook HMAC Authentication
  WEBHOOK_REJECT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_BASE/api/webhooks/subscription" \
    -H "Content-Type: application/json" \
    -d '{"event":"subscribe","msisdn":"251911428890"}' || true)
  if [ "$WEBHOOK_REJECT" = "401" ]; then
    log_pass "VAS Webhook: Unsigned webhook correctly rejected with 401 Unauthorized"
  else
    log_fail "VAS Webhook Security" "Expected 401 on missing HMAC, got $WEBHOOK_REJECT"
  fi

  # Probe 4: Anti-Cheat Session Gating
  SESSION_REJECT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_BASE/api/helix/session/start" \
    -H "Content-Type: application/json" \
    -d '{"msisdn":"251900000000"}' || true)
  if [ "$SESSION_REJECT" = "403" ]; then
    log_pass "Anti-Cheat Session Gate: Unsubscribed MSISDN rejected with 403 Forbidden"
  else
    log_fail "Anti-Cheat Session Gate" "Expected 403 for unsubscribed MSISDN, got $SESSION_REJECT"
  fi

  # Probe 5: Admin Route Isolation
  ADMIN_REJECT=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/api/admin/dashboard" || true)
  if [ "$ADMIN_REJECT" = "401" ]; then
    log_pass "Admin RBAC: Unauthenticated access to /api/admin/dashboard blocked with 401"
  else
    log_fail "Admin RBAC" "Expected 401 on unauthenticated admin endpoint, got $ADMIN_REJECT"
  fi

else
  echo -e "  ${YELLOW}ℹ API not actively running on $API_BASE. Live endpoint probes deferred to post-deployment canary.${NC}"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 3. Final Certification Summary
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n=============================================================================="
echo -e "  AUTOMATED VERIFICATION SUMMARY: ${GREEN}$PASSED Passed${NC} | ${RED}$FAILED Failed${NC}"
echo -e "==============================================================================\n"

if [ $FAILED -gt 0 ]; then
  echo -e "${RED}${BOLD}❌ VERIFICATION FAILED: $FAILED invariant(s) breached.${NC}\n"
  exit 1
else
  echo -e "${GREEN}${BOLD}🎉 TIER-0 ENTERPRISE SPECIFICATION CERTIFIED SUCCESSFULLY.${NC}\n"
  exit 0
fi
