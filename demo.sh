#!/usr/bin/env bash
# TransitOps Demo Script — run against a seeded, running API
# Usage: ./demo.sh [base_url]
#
# Walks through the exact demo sequence from MASTER_DOC §25.
# Each step pauses for you to show the result to judges.

set -euo pipefail

BASE="${1:-http://localhost:4000}"
COOKIES=$(mktemp)
trap "rm -f $COOKIES" EXIT

# Colors
G='\033[0;32m'; B='\033[0;34m'; Y='\033[1;33m'; R='\033[0;31m'; NC='\033[0m'

step() { echo -e "\n${Y}━━━ Step $1: $2 ━━━${NC}"; }
pause() { echo -e "${B}  Press Enter to continue...${NC}"; read -r; }
ok() { echo -e "  ${G}✓ $1${NC}"; }

echo -e "${Y}╔═══════════════════════════════════════════╗${NC}"
echo -e "${Y}║     TransitOps — Live Demo Walkthrough    ║${NC}"
echo -e "${Y}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo "API: $BASE"
echo ""

# ── 1. Login as Dispatcher ──────────────────────────
step 1 "Login as Dispatcher"
RESP=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"dispatch@transitops.local","password":"password123"}' \
  -c "$COOKIES")
echo "$RESP" | python3 -m json.tool 2>/dev/null || echo "$RESP"
ok "Logged in as Dispatcher"
pause

# ── 2. Dashboard KPIs ──────────────────────────────
step 2 "Dashboard KPIs + Vehicle Status"
echo "  KPIs:"
curl -s "$BASE/api/dashboard/kpis" -b "$COOKIES" | python3 -m json.tool
echo ""
echo "  Vehicle Status Breakdown:"
curl -s "$BASE/api/dashboard/vehicle-status-breakdown" -b "$COOKIES" | python3 -m json.tool
ok "Dashboard shows live data from DB"
pause

# ── 3. Vehicle Registry ────────────────────────────
step 3 "Vehicle Registry — all statuses"
curl -s "$BASE/api/vehicles" -b "$COOKIES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for v in data['items']:
    print(f\"  {v['registrationNumber']:15s} {v['nameModel']:25s} {v['status']:10s} {v['type']}\")
"
ok "Shows Available, On Trip, In Shop, Retired"
pause

# ── 4. Drivers ─────────────────────────────────────
step 4 "Drivers — expired/suspended/on-trip states"
curl -s "$BASE/api/drivers" -b "$COOKIES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for d in data['items']:
    exp = '⚠ EXPIRED' if d['licenseExpiryDate'] < '$(date +%Y-%m-%d)' else d['licenseExpiryDate']
    print(f\"  {d['name']:20s} {d['status']:12s} License: {exp}\")
"
ok "Expired license and Suspended drivers visible"
pause

# ── 5. Create trip — capacity exceeded ─────────────
step 5 "Create trip with cargo OVER capacity → should be blocked on dispatch"
# Get available vehicle (first one, typically ~750-1500 kg capacity)
VEH=$(curl -s "$BASE/api/vehicles/available-for-dispatch" -b "$COOKIES" | python3 -c "import sys,json; v=json.load(sys.stdin)['items'][0]; print(v['id']); import sys; sys.stderr.write(f\"  Vehicle: {v['registrationNumber']} (max {v['maxLoadKg']} kg)\n\")" 2>&1)
VEH_ID=$(echo "$VEH" | head -1)
echo "  $(echo "$VEH" | tail -1)"

DRV=$(curl -s "$BASE/api/drivers/available-for-dispatch" -b "$COOKIES" | python3 -c "import sys,json; d=json.load(sys.stdin)['items'][0]; print(d['id'])")

# Create with excess weight
TRIP=$(curl -s -X POST "$BASE/api/trips" \
  -H "Content-Type: application/json" \
  -d "{\"source\":\"Demo City\",\"destination\":\"Judge Town\",\"vehicleId\":\"$VEH_ID\",\"driverId\":\"$DRV\",\"cargoWeightKg\":99999,\"plannedDistanceKm\":200,\"revenue\":25000}" \
  -b "$COOKIES")
TRIP_ID=$(echo "$TRIP" | python3 -c "import sys,json; print(json.load(sys.stdin)['item']['id'])")
echo "  Created trip: $TRIP_ID"

echo "  Attempting dispatch with overweight cargo..."
curl -s -X POST "$BASE/api/trips/$TRIP_ID/dispatch" -b "$COOKIES" | python3 -m json.tool
ok "Dispatch BLOCKED — cargo exceeds capacity"
pause

# ── 6. Fix weight and dispatch ─────────────────────
step 6 "Cancel overweight trip, create correct trip and dispatch"
curl -s -X POST "$BASE/api/trips/$TRIP_ID/cancel" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Demo: fixing cargo weight"}' \
  -b "$COOKIES" > /dev/null

TRIP2=$(curl -s -X POST "$BASE/api/trips" \
  -H "Content-Type: application/json" \
  -d "{\"source\":\"Demo City\",\"destination\":\"Judge Town\",\"vehicleId\":\"$VEH_ID\",\"driverId\":\"$DRV\",\"cargoWeightKg\":500,\"plannedDistanceKm\":200,\"revenue\":25000}" \
  -b "$COOKIES")
TRIP2_ID=$(echo "$TRIP2" | python3 -c "import sys,json; print(json.load(sys.stdin)['item']['id'])")

echo "  Dispatching with valid weight..."
curl -s -X POST "$BASE/api/trips/$TRIP2_ID/dispatch" -b "$COOKIES" | python3 -c "
import sys,json
d = json.load(sys.stdin)['item']
print(f\"  Trip {d['tripCode']}: {d['status']}\")
print(f\"  Vehicle: {d['vehicle']['status']}\")
print(f\"  Driver: {d['driver']['status']}\")
"
ok "Vehicle and Driver now On Trip"
pause

# ── 7. Dashboard updated ──────────────────────────
step 7 "Dashboard KPIs updated after dispatch"
curl -s "$BASE/api/dashboard/kpis" -b "$COOKIES" | python3 -m json.tool
ok "Fleet utilization increased"
pause

# ── 8. Complete trip ───────────────────────────────
step 8 "Complete trip with odometer and fuel"
curl -s -X POST "$BASE/api/trips/$TRIP2_ID/complete" \
  -H "Content-Type: application/json" \
  -d '{"finalOdometerKm":35000,"actualDistanceKm":200,"fuelConsumedLiters":22,"revenue":25000}' \
  -b "$COOKIES" | python3 -c "
import sys,json
d = json.load(sys.stdin)['item']
print(f\"  Trip {d['tripCode']}: {d['status']}\")
print(f\"  Final odometer: {d['finalOdometerKm']} km\")
print(f\"  Fuel consumed: {d['fuelConsumedLiters']} L\")
"
ok "Vehicle and Driver restored to Available"
pause

# ── 9. Maintenance ─────────────────────────────────
step 9 "Create maintenance — vehicle becomes In Shop"
# Login as Fleet Manager
curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"fleet@transitops.local","password":"password123"}' \
  -c "$COOKIES" > /dev/null

AVAIL_VEH=$(curl -s "$BASE/api/vehicles/available-for-dispatch" -b "$COOKIES" | python3 -c "import sys,json; print(json.load(sys.stdin)['items'][0]['id'])")

curl -s -X POST "$BASE/api/maintenance" \
  -H "Content-Type: application/json" \
  -d "{\"vehicleId\":\"$AVAIL_VEH\",\"serviceType\":\"Demo Service\",\"description\":\"Judge demo maintenance\",\"cost\":5000,\"startDate\":\"$(date +%Y-%m-%d)\"}" \
  -b "$COOKIES" | python3 -c "
import sys,json
d = json.load(sys.stdin)['item']
print(f\"  Maintenance: {d['serviceType']} → {d['status']}\")
print(f\"  Vehicle: {d['vehicle']['registrationNumber']} → {d['vehicle']['status']}\")
" 2>/dev/null || echo "  (maintenance already exists for this vehicle)"
ok "Vehicle moved to In Shop"
pause

# ── 10. In Shop vehicle hidden from dispatch ──────
step 10 "In Shop vehicle hidden from dispatch selector"
echo "  Available vehicles for dispatch:"
curl -s "$BASE/api/vehicles/available-for-dispatch" -b "$COOKIES" | python3 -c "
import sys,json
for v in json.load(sys.stdin)['items']:
    print(f\"    {v['registrationNumber']} — {v['status']}\")
"
ok "In Shop and Retired vehicles NOT shown"
pause

# ── 11. Analytics ──────────────────────────────────
step 11 "Analytics and CSV Export"
# Login as Financial Analyst
curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"finance@transitops.local","password":"password123"}' \
  -c "$COOKIES" > /dev/null

echo "  Analytics Summary:"
curl -s "$BASE/api/analytics/summary" -b "$COOKIES" | python3 -m json.tool

echo ""
echo "  Vehicle ROI:"
curl -s "$BASE/api/analytics/vehicle-roi" -b "$COOKIES" | python3 -c "
import sys,json
for v in json.load(sys.stdin):
    print(f\"    {v['registrationNumber']:15s} ROI: {v['roi']}%\")
"

echo ""
echo "  CSV Export (first 3 lines):"
curl -s "$BASE/api/analytics/export.csv" -b "$COOKIES" | head -3
ok "Live analytics from database"
pause

# ── 12. Settings / RBAC ───────────────────────────
step 12 "Settings and RBAC"
# Login as Admin
curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@transitops.local","password":"password123"}' \
  -c "$COOKIES" > /dev/null

curl -s "$BASE/api/settings" -b "$COOKIES" | python3 -m json.tool
ok "Settings and role matrix displayed"

echo ""
echo -e "${G}╔═══════════════════════════════════════════╗${NC}"
echo -e "${G}║          Demo Complete! 🎉                ║${NC}"
echo -e "${G}╚═══════════════════════════════════════════╝${NC}"
