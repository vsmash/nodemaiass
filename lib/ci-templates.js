import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import colors from './colors.js';
import { SYMBOLS } from './symbols.js';

// Resolve the templates directory relative to this file (works after npm install -g)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates', 'ci');

// Read a template from disk and substitute placeholders for the user's configured
// branch names. The develop-branch trigger filter in GitHub Actions / GitLab CI /
// Bitbucket Pipelines must be a YAML literal — there is no runtime escape hatch —
// so we bake the value in at install time from MAIASS_DEVELOPBRANCH.
function renderTemplate(src) {
  // .trim() guards against a stray newline or whitespace from a mis-quoted
  // .env.maiass entry silently breaking the YAML trigger filter
  const developBranch = (process.env.MAIASS_DEVELOPBRANCH || 'develop').trim() || 'develop';
  return fs.readFileSync(src, 'utf8').replaceAll('__MAIASS_DEVELOPBRANCH__', developBranch);
}

/**
 * Copy a CI template file to the target path in the current project.
 * Creates intermediate directories if needed.
 * Prompts before overwriting an existing file.
 */
function copyTemplate(templateFile, targetPath, label) {
  const src = path.join(TEMPLATES_DIR, templateFile);

  // Verify the template exists in the package
  if (!fs.existsSync(src)) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Template not found: ${src}`));
    console.error(colors.Gray('This may indicate a broken installation — try: npm install -g maiass'));
    process.exit(1);
  }

  // Warn rather than silently overwrite
  if (fs.existsSync(targetPath)) {
    console.warn(colors.Yellow(`${SYMBOLS.WARNING} ${targetPath} already exists — skipping.`));
    console.warn(colors.Gray(`  Delete it first if you want a fresh copy.`));
    return;
  }

  // Create parent directories (e.g. .github/workflows/)
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, renderTemplate(src));

  console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} Created ${targetPath}`));
  console.log(colors.Gray(`  ${label}`));
}

/**
 * Print a template to stdout so the user can copy it manually.
 * Used for Bitbucket where the file location varies per project.
 */
function showTemplate(templateFile, label) {
  const src = path.join(TEMPLATES_DIR, templateFile);

  if (!fs.existsSync(src)) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Template not found: ${src}`));
    process.exit(1);
  }

  console.log(colors.BGreen(`\n${label}\n`));
  console.log(colors.Gray('─'.repeat(60)));
  console.log(renderTemplate(src));
  console.log(colors.Gray('─'.repeat(60)));
  console.log(colors.Gray('Copy the above into your bitbucket-pipelines.yml\n'));
}

/**
 * Handle --create-gh-action
 * Copies the GitHub Actions version-bump workflow into .github/workflows/
 */
export function createGithubAction() {
  copyTemplate(
    'github-version-bump.yml',
    path.join(process.cwd(), '.github', 'workflows', 'maiass-version-bump.yml'),
    'Next: add a GH_PAT secret in your repo → Settings → Secrets → Actions'
  );
}

/**
 * Handle --show-gl-excerpt
 * Prints the GitLab CI excerpt to stdout — users merge it into their existing .gitlab-ci.yml
 */
export function showGitlabExcerpt() {
  showTemplate(
    'gitlab-ci-excerpt.yml',
    'MAIASS — GitLab CI excerpt (merge into your .gitlab-ci.yml)'
  );
}

/**
 * Handle --show-bb-excerpt
 * Prints the Bitbucket Pipelines excerpt to stdout — users merge it into their existing bitbucket-pipelines.yml
 */
export function showBitbucketExcerpt() {
  showTemplate(
    'bitbucket-pipelines-excerpt.yml',
    'MAIASS — Bitbucket Pipelines excerpt (merge into your bitbucket-pipelines.yml)'
  );
}
