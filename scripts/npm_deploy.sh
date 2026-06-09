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

# ── Ensure GitHub CLI is acting as vsmash + has the 'workflow' scope ──────────
# MAIASS repos live under the vsmash account, and creating a GitHub release in a
# repo that contains .github/workflows requires the token's 'workflow' scope.
# Verified (and auto-switched) in pre-flight, BEFORE any irreversible step, so a
# release failure can't strand us after `npm publish`.
require_gh_vsmash() {
  local want="vsmash" active scopes
  command -v gh >/dev/null 2>&1 || { error "gh CLI not found — required to create the GitHub release."; exit 1; }
  active=$(gh api user --jq .login 2>/dev/null || true)
  if [[ "$active" != "$want" ]]; then
    gh auth switch -u "$want" >/dev/null 2>&1 || true
    active=$(gh api user --jq .login 2>/dev/null || true)
  fi
  if [[ "$active" != "$want" ]]; then
    error "GitHub CLI must be authenticated as '$want' (currently: ${active:-none}). Fix: gh auth switch -u $want"
    exit 1
  fi
  scopes=$(gh api -i user 2>/dev/null | grep -i '^x-oauth-scopes:' | cut -d: -f2- | tr -d ' \r')
  case ",$scopes," in
    *,workflow,*) : ;;
    *) error "gh token for '$want' lacks the 'workflow' scope (needed to create GitHub releases). Fix: gh auth refresh -h github.com -s workflow"; exit 1 ;;
  esac
}

# ── Trap: print a clear message if anything fails ────────────────────────────
trap 'error "Deploy aborted at line $LINENO. Check the output above for details."; git checkout "$CURRENT_BRANCH" 2>/dev/null && warn "Returned to branch: $CURRENT_BRANCH"' ERR

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

# GitHub release (final step) needs the vsmash account + 'workflow' scope.
# Verify NOW, before merges/tag/publish, so we never publish then fail on release.
require_gh_vsmash
success "GitHub CLI authenticated as vsmash (workflow scope present)"

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

# ── GitHub release ────────────────────────────────────────────────────────────
step "Creating GitHub release"

if command -v gh &>/dev/null; then
  NPM_URL="https://www.npmjs.com/package/maiass/v/${VERSION}"
  gh release create "v${VERSION}" \
    --title "MAIASS v${VERSION}" \
    --notes "## Install

\`\`\`bash
npm install -g maiass@${VERSION}
\`\`\`

[View on npm](${NPM_URL})" \
    --latest
  success "GitHub release v${VERSION} created"
else
  warn "gh CLI not found — skipping GitHub release creation"
  info "Create it manually at: https://github.com/vsmash/nodemaiass/releases/new?tag=v${VERSION}"
fi

# ── Return to original branch ─────────────────────────────────────────────────
step "Cleaning up"

info "Returning to ${BOLD}$CURRENT_BRANCH${RESET}..."
git checkout "$CURRENT_BRANCH"
git merge main
git push
success "Branch ${BOLD}$CURRENT_BRANCH${RESET} is in sync with main"

echo ""
echo -e "${GREEN}${BOLD}🎉  Deploy complete — v${VERSION} is live on npm and GitHub${RESET}"
# make sure user knows what branch they're on
echo -e "${YELLOW}   You are currently on branch: ${BOLD}$CURRENT_BRANCH${RESET}"
echo ""
