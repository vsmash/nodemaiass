#!/bin/bash
# npm_deploy.sh — promote develop → staging → main and publish to npm
set -e  # exit immediately if any command fails

# ── Colours ──────────────────────────────────────────────────────────────────
BOLD="\033[1m"
RESET="\033[0m"
CYAN="\033[1;36m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"

info()    { echo -e "${CYAN}▶  $*${RESET}"; }
success() { echo -e "${GREEN}✔  $*${RESET}"; }
warn()    { echo -e "${YELLOW}⚠  $*${RESET}"; }
error()   { echo -e "${RED}✘  $*${RESET}" >&2; }
step()    { echo -e "\n${BOLD}${CYAN}── $* ──${RESET}"; }

# ── Trap: print a clear message if anything fails ────────────────────────────
trap 'error "Deploy aborted at line $LINENO. Check the output above for details."' ERR

# ── Pre-flight checks ─────────────────────────────────────────────────────────
step "Pre-flight checks"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
info "Starting from branch: ${BOLD}$CURRENT_BRANCH${RESET}"

# Abort if working directory is dirty
if ! git diff --quiet || ! git diff --cached --quiet; then
  error "Working directory is dirty. Commit or stash your changes before deploying."
  exit 1
fi
success "Working directory is clean"

# Read version from develop (where the bump happened), not the current branch
VERSION=$(git show develop:package.json | node -p "JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).version" 2>/dev/null \
  || git show develop:package.json | grep '"version"' | head -1 | sed 's/.*: *"\(.*\)".*/\1/')
info "Version to publish: ${BOLD}v${VERSION}${RESET} (from develop)"

# Confirm before proceeding
echo ""
warn "This will merge develop → staging → main and publish v${VERSION} to npm."
read -rp "$(echo -e "${YELLOW}   Continue? [y/N] ${RESET}")" CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  warn "Deploy cancelled."
  exit 0
fi

# ── Promote to staging ────────────────────────────────────────────────────────
step "Promoting to staging"

info "Switching to staging..."
git checkout staging
git pull
info "Merging develop into staging..."
git merge develop
git push
success "staging is up to date"

# ── Promote to main ───────────────────────────────────────────────────────────
step "Promoting to main"

info "Switching to main..."
git checkout main
info "Merging staging into main..."
git merge staging
git push
success "main is up to date"

# ── Tag the release on main ───────────────────────────────────────────────────
step "Tagging release"

git tag -a "v${VERSION}" -m "Release v${VERSION}"
git push origin "v${VERSION}"
success "Tagged v${VERSION} on main"

# ── npm publish ───────────────────────────────────────────────────────────────
step "Publishing to npm"

if ! npm whoami --silent 2>/dev/null; then
  warn "Not logged in to npm. Please log in:"
  npm login
fi

info "Publishing v${VERSION}..."
npm publish
success "v${VERSION} published to npm"

# ── Return to original branch ─────────────────────────────────────────────────
step "Cleaning up"

info "Returning to ${BOLD}$CURRENT_BRANCH${RESET}..."
git checkout "$CURRENT_BRANCH"
git merge main
git push
success "Branch ${BOLD}$CURRENT_BRANCH${RESET} is in sync with main"

echo ""
echo -e "${GREEN}${BOLD}🎉  Deploy complete — v${VERSION} is live on npm${RESET}"
# make sure user knows what branch they're on
echo -e "${YELLOW}   You are currently on branch: ${BOLD}$CURRENT_BRANCH${RESET}"
echo ""
