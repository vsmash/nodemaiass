# nodemaiass — Claude context

## What this is
Node.js CLI for the MAIASS git workflow tool. Entry point is `maiass.mjs`. Built with ESM, distributed as a standalone binary via `pkg` / `build.js`.

## Running / developing
```sh
nvm use                    # always first — project targets Node 23
node maiass.mjs            # run directly
node maiass.mjs --setup    # run setup wizard
npm run build              # build standalone binary to dist/
```

## Key files
| File | Purpose |
|------|---------|
| `maiass.mjs` | Entry point — CLI arg parsing, first-run detection, routes to commands |
| `lib/maiass-command.js` | Parses commit command args, calls `runMaiassPipeline()` |
| `lib/maiass-pipeline.js` | Main workflow: merge → version → changelog → tag → push |
| `lib/commit.js` | AI commit message generation — calls maiass-proxy, streams response |
| `lib/bootstrap.js` | `--setup` wizard: project type, version source, features, branches |
| `lib/version-manager.js` | Version file detection, parsing, bumping, writing |
| `lib/config-manager.js` | Reads `.env.maiass` + `.env.maiass.local` into `process.env` |
| `lib/git-info.js` | Git branch, status, diff helpers |
| `lib/colors.js` | Terminal colour helpers |
| `lib/logger.js` | Branded log output (`log.info`, `log.success`, etc.) |
| `lib/input-utils.js` | `getSingleCharInput`, `getLineInput` — interactive prompts |

## Pipeline flow (normal commit run)
1. `maiass.mjs` — first-run check, load config, parse args
2. `maiass-command.js` — determine bump type, call `runMaiassPipeline()`
3. `maiass-pipeline.js`:
   - Commit phase → `commit.js` (AI message, git add/commit)
   - Merge phase → merge feature → develop (if configured)
   - Version phase → `version-manager.js` (bump, write file)
   - Changelog phase → `changelog.js`
   - Tag + push phase
   - End: print "Thank you", credits remaining, top-up link

## First-run behaviour
- If neither `.env.maiass` nor `.env.maiass.local` exists → first run
- Creates `.env.maiass.local`, adds to `.gitignore`, sets `MAIASS_MODE=ai_only`, shows welcome message
- Proceeds straight to commit — no blocking wizard
- `--setup` flag triggers full wizard via `bootstrapProject()` in `bootstrap.js`

## Version management
- `MAIASS_VERSION_PRIMARY_FILE` in `.env.maiass` sets the version file
- Supported types: `json` (package.json), `php` (composer/WordPress), `txt` (VERSION), `xcodeproj` (.pbxproj)
- `xcodeproj` type: manages `MARKETING_VERSION` (semver) + auto-increments `CURRENT_PROJECT_VERSION` (build integer)
- `detectPbxproj()` in `bootstrap.js` searches 2 levels deep for `.xcodeproj` bundles
- `detectVersionFiles()` in `version-manager.js` does the same at runtime
- `parseVersion()` accepts both `x.y` and `x.y.z`

## Credit display
- `commit.js` sets `process.env.MAIASS_CREDITS_REMAINING` after AI call
- Credits shown once at end of pipeline in `maiass-pipeline.js`, not inline during streaming
- "Credit top-up link:" label (not "Need more credits?")

## Config env vars (set in .env.maiass)
`MAIASS_MODE`, `MAIASS_VERSION_PRIMARY_FILE`, `MAIASS_VERSION_PRIMARY_TYPE`, `MAIASS_DEVELOP_BRANCH`, `MAIASS_MAIN_BRANCH`, `MAIASS_AI_COMMITS`, `MAIASS_CHANGELOG`, `MAIASS_DEBUG`
