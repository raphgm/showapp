#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Manual deploy script for ShowApp
#
# Usage:
#   ./deploy.sh                  # commit everything and push → triggers CI/CD
#   ./deploy.sh --build-only     # only build locally (no push)
#   ./deploy.sh --message "msg"  # custom commit message
# =============================================================================

set -euo pipefail

# ── Defaults ────────────────────────────────────────────────────────────────
REPO_URL="https://github.com/raphgm/showapp.git"
BRANCH="main"
COMMIT_MSG="chore: deploy $(date '+%Y-%m-%d %H:%M')"
BUILD_ONLY=false

# ── Parse args ───────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --build-only)   BUILD_ONLY=true; shift ;;
    --message|-m)   COMMIT_MSG="$2"; shift 2 ;;
    *)              echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

log()  { echo -e "${CYAN}${BOLD}▶ $*${RESET}"; }
ok()   { echo -e "${GREEN}✔ $*${RESET}"; }
warn() { echo -e "${YELLOW}⚠ $*${RESET}"; }
die()  { echo -e "${RED}✖ $*${RESET}" >&2; exit 1; }

# ── 1. Preflight ─────────────────────────────────────────────────────────────
log "Preflight checks"
command -v node >/dev/null 2>&1 || die "Node.js not found"
command -v npm  >/dev/null 2>&1 || die "npm not found"
command -v git  >/dev/null 2>&1 || die "git not found"

NODE_VER=$(node -e "process.exit(+process.version.slice(1).split('.')[0] < 18)" 2>/dev/null && echo ok || echo fail)
[[ "$NODE_VER" == "fail" ]] && die "Node ≥ 18 required (found $(node --version))"
ok "Node $(node --version) · npm $(npm --version)"

# ── 2. Install dependencies ──────────────────────────────────────────────────
log "Installing dependencies"
npm ci --prefer-offline 2>&1 | tail -5
ok "Dependencies ready"

# ── 3. Build ─────────────────────────────────────────────────────────────────
log "Building production bundle"

# Load local .env if present (won't override variables already in the env)
if [[ -f .env ]]; then
  set -a; source .env; set +a
  ok "Loaded .env"
fi

npm run build
ok "Build complete → dist/"

if [[ "$BUILD_ONLY" == true ]]; then
  warn "--build-only flag set, skipping git push"
  exit 0
fi

# ── 4. Git setup ─────────────────────────────────────────────────────────────
log "Preparing git repository"

if [[ ! -d .git ]]; then
  git init -b "$BRANCH"
  ok "Initialised git repo"
fi

# Ensure remote is set
if git remote get-url origin >/dev/null 2>&1; then
  CURRENT_REMOTE=$(git remote get-url origin)
  if [[ "$CURRENT_REMOTE" != "$REPO_URL" ]]; then
    warn "Remote 'origin' points to $CURRENT_REMOTE — updating to $REPO_URL"
    git remote set-url origin "$REPO_URL"
  fi
else
  git remote add origin "$REPO_URL"
  ok "Remote 'origin' added → $REPO_URL"
fi

# ── 5. Stage & commit ────────────────────────────────────────────────────────
log "Staging changes"

# Never commit secrets or build artefacts
if [[ -f .env ]]; then
  warn ".env detected — will NOT be committed (already in .gitignore)"
fi

git add \
  vite.config.ts \
  deploy.sh \
  components/ShowStudio.tsx \
  .github/workflows/deploy.yml \
  package.json \
  package-lock.json \
  index.html \
  index.tsx \
  App.tsx \
  types.ts \
  tsconfig.json \
  vite-env.d.ts \
  no-radius.css \
  constants/ \
  pages/ \
  services/ \
  public/ \
  api/ 2>/dev/null || true

# Stage anything else that is already tracked
git add -u

STAGED=$(git diff --cached --name-only | wc -l | tr -d ' ')
if [[ "$STAGED" -eq 0 ]]; then
  ok "Nothing new to commit — pushing existing HEAD"
else
  git commit -m "$COMMIT_MSG"
  ok "Committed $STAGED file(s): \"$COMMIT_MSG\""
fi

# ── 6. Push ──────────────────────────────────────────────────────────────────
log "Pushing to GitHub ($BRANCH)"

# Try a normal push; if the remote is ahead, pull --rebase first
if ! git push -u origin "$BRANCH" 2>&1; then
  warn "Push failed — attempting pull --rebase then retry"
  git pull --rebase origin "$BRANCH"
  git push -u origin "$BRANCH"
fi

ok "Pushed to github.com/raphgm/showapp ($BRANCH)"

# ── 7. Done ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}  ShowApp deployed successfully!${RESET}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════${RESET}"
echo ""
echo -e "  ${BOLD}Repo:${RESET}   https://github.com/raphgm/showapp"
echo -e "  ${BOLD}Live:${RESET}   https://raphgm.github.io/showapp"
echo -e "  ${BOLD}CI/CD:${RESET}  https://github.com/raphgm/showapp/actions"
echo ""
echo -e "  GitHub Actions will build & publish to Pages automatically."
echo -e "  Check the Actions tab for build status."
echo ""
