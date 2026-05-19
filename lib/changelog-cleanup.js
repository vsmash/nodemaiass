// Changelog cleanup (MAI-47).
//
// `--cleanup-changelogs` runs an AI-assisted pass over CHANGELOG.md (public)
// and .CHANGELOG_internal.md (internal) when they exist. Each file is treated
// independently — neither is derived from the other. The pass:
//
//   1. Backs up each file (overwrites previous .bak; auto-gitignored).
//   2. Walks the file's version sections grouped by minor version (newest
//      first). For each group it sends the existing block + the git commits
//      that fall in that version range to the AI, then receives a cleaned
//      block back in the canonical MAIASS format.
//   3. Re-emits the file from the cleaned groups + any original preamble.
//
// Style differences are encoded in the AI prompt: internal keeps MAI-XXX
// tickets and author names; public strips both and rewrites in a customer-
// facing voice. Either file may be absent — the cleanup just skips what
// isn't there.
//
// Failure mode: any error (no token, AI timeout, parse failure) restores
// the .bak and exits non-zero. The bump pipeline is never blocked because
// this command is opt-in / explicit.

import { execSync, spawnSync } from 'child_process';
import fs from 'fs/promises';
import { existsSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { log } from './logger.js';
import { SYMBOLS } from './symbols.js';
import colors from './colors.js';
import { createAnonymousSubscriptionIfNeeded } from './commit.js';
import { generateMachineFingerprint } from './machine-fingerprint.js';
import { getClientName, getClientVersion } from './client-info.js';
import { getSingleCharInput } from './input-utils.js';

export const FLAGS = ['--cleanup-changelogs'];

/** Largest single AI request, bytes of combined input. Beyond this, a minor
 *  group is split by date before sending. */
const CHUNK_THRESHOLD_BYTES = 20 * 1024;

/** Hard cap on AI output tokens per chunk. Commit messages need 150; a
 *  cleaned changelog chunk can run to ~1500–3000 chars, so 2000 tokens is a
 *  safe ceiling. */
const MAX_OUTPUT_TOKENS = 2000;

/**
 * MAIASS_AI_MODE values that count as "AI on". The bump pipeline treats
 * anything other than 'off' as on; we mirror that here.
 */
function isAIModeActive() {
  const mode = String(process.env.MAIASS_AI_MODE || 'ask').toLowerCase();
  return mode !== 'off' && mode !== 'false' && mode !== 'disabled';
}

function executeGitCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

/**
 * Build the version → commits map from git history. We anchor on
 * "Bumped version to X" commits rather than tags because tags are
 * frequently missing (e.g. nodemaiass has tags for 5.10.0/.1/.2/.4 but not
 * .3, and for 5.12.0/.2/.3/.9 but not .1/.4–.8). Bump commits are produced
 * by MAIASS itself on every release, so they're comprehensive.
 *
 * Returns { ordered, byVersion }:
 *   ordered: array of version strings, newest first
 *   byVersion: Map<version, Array<{hash, author, body}>>
 *              — content commits only, with the bump commit + merges filtered out.
 */
function buildVersionCommitMap() {
  // %ai is the author date in ISO 8601 (committer-date independent). We grab
  // it alongside the hash + subject so the cleanup prompt can fill in a date
  // line when the existing changelog block has none.
  const raw = executeGitCommand('git log --pretty=format:"%H\t%ai\t%s" --grep="^Bumped version to "');
  if (!raw) return { ordered: [], byVersion: new Map(), dateByVersion: new Map() };

  const bumps = [];
  for (const line of raw.split('\n')) {
    const parts = line.split('\t');
    if (parts.length < 3) continue;
    const [hash, isoDate, subject] = parts;
    const m = subject.match(/^Bumped version to (\S+)/);
    if (m) bumps.push({ hash, version: m[1], isoDate });
  }

  const byVersion = new Map();
  const dateByVersion = new Map();
  for (let i = 0; i < bumps.length; i++) {
    const { hash, version, isoDate } = bumps[i];
    const olderBumpHash = bumps[i + 1]?.hash;
    const range = olderBumpHash ? `${olderBumpHash}..${hash}` : hash;
    byVersion.set(version, readCommitRange(range, hash));
    // Use the bump commit's date as the version's reference date — that's
    // the actual moment of release.
    dateByVersion.set(version, isoDate.slice(0, 10));
  }

  return {
    ordered: bumps.map(b => b.version),
    byVersion,
    dateByVersion
  };
}

/**
 * Read commits in a git range with author + full message. Uses ASCII RS/US
 * separators so commit bodies can contain anything (including newlines and
 * the colons MAIASS uses) without confusing the parser.
 *
 * Excludes:
 *   - the bump commit itself (excludeHash) — its only content is "Bumped version to X"
 *   - merge commits (via --no-merges)
 *   - any commit whose subject still looks like a bump / merge-conflict fixup
 */
function readCommitRange(range, excludeHash) {
  const RS = '\x1e';
  const US = '\x1f';
  const fmt = `%H${US}%an${US}%B${RS}`;
  const raw = executeGitCommand(`git log --no-merges --pretty=format:"${fmt}" ${range}`);
  if (!raw) return [];

  const out = [];
  for (const record of raw.split(RS)) {
    const trimmed = record.trim();
    if (!trimmed) continue;
    const [hash, author, body] = trimmed.split(US);
    if (!hash || hash === excludeHash) continue;
    const subject = (body || '').split('\n')[0];
    if (/^(Bumped version to|Merge|fixing merge conflicts)/i.test(subject)) continue;
    out.push({ hash, author: author || '', body: (body || '').trim() });
  }
  return out;
}

/**
 * Parse changelog text into { header, sections }. Each section captures the
 * lines between one `## VERSION` line and the next. The date line (whatever
 * follows the version header, modulo blank lines) is extracted; everything
 * else is body content.
 *
 * The parser is lenient on whitespace by design — the whole point of the
 * cleanup is to fix malformed input, so we accept stacked blank lines,
 * missing dates, etc. and let the AI rebuild.
 */
function parseChangelog(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const sections = [];
  let headerLines = [];
  let cur = null;
  let firstHeaderSeen = false;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^## (.+)$/);
    if (m) {
      if (!firstHeaderSeen) {
        headerLines = lines.slice(0, i);
        firstHeaderSeen = true;
      }
      if (cur) sections.push(cur);
      cur = { version: m[1].trim(), dateLine: '', body: [] };
      // The next non-blank line (within reason) is the date line.
      let j = i + 1;
      while (j < lines.length && !lines[j].trim() && j - i <= 3) j++;
      if (j < lines.length && !/^## /.test(lines[j])) {
        cur.dateLine = lines[j].trim();
        cur._dateLineIdx = j;
      }
    } else if (cur) {
      // Skip the line we already captured as the date.
      if (i !== cur._dateLineIdx) cur.body.push(lines[i]);
    }
  }
  if (cur) sections.push(cur);

  for (const s of sections) {
    delete s._dateLineIdx;
    while (s.body.length && !s.body[0].trim()) s.body.shift();
    while (s.body.length && !s.body[s.body.length - 1].trim()) s.body.pop();
  }

  return {
    header: headerLines.join('\n').replace(/\s+$/g, ''),
    sections
  };
}

/**
 * Compare two dot-separated version strings. Returns true iff a > b.
 * Used by the same-date consolidator to pick which patch number to use
 * as the merged section header.
 */
function semverGt(a, b) {
  const pa = String(a).split('.').map(n => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map(n => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x !== y) return x > y;
  }
  return false;
}

/**
 * Normalise a date line to a comparable key. Strips the optional weekday
 * suffix ("(Wednesday)") and trims surrounding whitespace, so
 * "13 May 2026 (Wednesday)" and "13 May 2026" collapse to the same key.
 * Returns an empty string for unparseable lines so they cluster together
 * separately rather than being randomly merged.
 */
function dateKey(dateLine) {
  if (!dateLine) return '';
  const m = String(dateLine).match(/^\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  return m ? `${m[1]} ${m[2]} ${m[3]}` : '';
}

/**
 * Post-process a cleaned chunk to merge same-date sections.
 *
 * The AI is supposed to consolidate same-date patches into one section via
 * the prompt's grouping rule, but it under-applies when the patches aren't
 * adjacent in the version sequence (e.g. 5.12.7 on 13 May and 5.12.13 on
 * 13 May stayed as two sections because 5.12.8/9/10/11/12 sit between them).
 *
 * This pass parses the AI output back into sections, groups by date, and
 * for each date with multiple sections produces ONE merged section whose
 * header is the latest patch number for that date and whose body is the
 * concatenated bullets (line-level dedup). Sections with empty/unparseable
 * date lines pass through unchanged.
 *
 * Order is preserved by the position of the latest-patch section in each
 * group, so the output stays newest-first within the minor.
 */
function consolidateSameDateSections(text) {
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const sections = [];
  let cur = null;
  let sawDate = false;

  const finish = () => {
    if (!cur) return;
    while (cur.body.length && !cur.body[0].trim()) cur.body.shift();
    while (cur.body.length && !cur.body[cur.body.length - 1].trim()) cur.body.pop();
    sections.push(cur);
  };

  for (const line of lines) {
    const m = line.match(/^## (.+)$/);
    if (m) {
      finish();
      cur = { version: m[1].trim(), dateLine: '', body: [] };
      sawDate = false;
      continue;
    }
    if (!cur) continue;
    if (!sawDate) {
      if (!line.trim()) continue;                    // skip blanks between header and date
      if (line.trim().startsWith('-')) {
        // No date line at all — bullet starts straight away.
        sawDate = true;
        cur.body.push(line);
        continue;
      }
      cur.dateLine = line.trim();
      sawDate = true;
      continue;
    }
    cur.body.push(line);
  }
  finish();

  if (sections.length === 0) return text;

  // Bucket sections by normalised date key. Sections with no date go into
  // their own "no-date" bucket and aren't merged with each other.
  const buckets = new Map();
  for (const s of sections) {
    const key = dateKey(s.dateLine) || `__nodate__${sections.indexOf(s)}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(s);
  }

  const merged = new Map();
  for (const [key, bucket] of buckets) {
    if (bucket.length === 1) {
      merged.set(key, bucket[0]);
      continue;
    }
    // Pick the section with the highest patch as the header source.
    let latest = bucket[0];
    for (const s of bucket) if (semverGt(s.version, latest.version)) latest = s;

    // Concatenate bodies with line-level dedup on bullet lines.
    const out = [];
    const seenBullets = new Set();
    for (const s of bucket) {
      for (const line of s.body) {
        if (line.trim().startsWith('-')) {
          const k = line.trim();
          if (seenBullets.has(k)) continue;
          seenBullets.add(k);
        }
        out.push(line);
      }
    }
    while (out.length && !out[0].trim()) out.shift();
    while (out.length && !out[out.length - 1].trim()) out.pop();

    merged.set(key, { version: latest.version, dateLine: latest.dateLine, body: out });
  }

  // Emit in the order the first member of each bucket appeared, so we
  // preserve the AI's newest-first ordering for distinct dates.
  const emitOrder = [];
  const seenKeys = new Set();
  for (const s of sections) {
    const key = dateKey(s.dateLine) || `__nodate__${sections.indexOf(s)}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    emitOrder.push(merged.get(key));
  }

  return emitOrder
    .map(s => {
      const header = `## ${s.version}`;
      const date = s.dateLine ? `\n${s.dateLine}` : '';
      const body = s.body.length ? `\n\n${s.body.join('\n')}` : '';
      return `${header}${date}${body}`;
    })
    .join('\n\n');
}

/**
 * Build minor-version groups in newest-first order. We seed the order from
 * git (so versions present in git but missing from the changelog surface
 * naturally) and append any changelog-only versions at the end.
 *
 * Same-minor versions are coalesced into ONE group even when git history
 * has them non-adjacent — long-lived projects often have a Bumped-version
 * commit from an old branch lineage interleaved with newer ones, and we
 * don't want to clean the same minor twice.
 *
 * Group order is first-occurrence-newest: the position of each minor in
 * the result is the position of its newest-seen version.
 */
function groupByMinor(sections, gitOrderedVersions) {
  const minorOf = v => v.split('.').slice(0, 2).join('.');

  const sectionByVersion = new Map(sections.map(s => [s.version, s]));
  const seen = new Set();
  const ordered = [];
  for (const v of gitOrderedVersions) {
    if (!seen.has(v)) { seen.add(v); ordered.push(v); }
  }
  for (const s of sections) {
    if (!seen.has(s.version)) { seen.add(s.version); ordered.push(s.version); }
  }

  const byMinor = new Map();
  for (const v of ordered) {
    const m = minorOf(v);
    if (!byMinor.has(m)) {
      byMinor.set(m, { minor: m, versions: [], sections: [] });
    }
    const g = byMinor.get(m);
    g.versions.push(v);
    const sec = sectionByVersion.get(v);
    if (sec) g.sections.push(sec);
  }
  return Array.from(byMinor.values());
}

/**
 * Build the system + user messages for a cleanup chunk.
 *
 * style: 'internal' | 'public'
 * group: { minor, versions, sections } from groupByMinor
 * commitsByVersion: Map<version, commits[]>
 */
function buildChunkMessages(style, group, commitsByVersion, commitDateByVersion) {
  const isInternal = style === 'internal';

  const dateFormat = isInternal
    ? '"DD Month YYYY (Weekday)" — e.g. "14 May 2026 (Thursday)"'
    : '"DD Month YYYY" — e.g. "14 May 2026"';

  const styleRules = isInternal
    ? [
        'Preserve MAI-XXX ticket prefixes from the source. If the source entry has no MAI-XXX, do NOT invent one — just omit it.',
        'Preserve the real author name from the source (e.g. "Mark Pottie", "vsmsh", "Tyler Durton"). Do NOT use the literal string "Author Name", "AUTHOR", or any placeholder. If no author is available, omit the author prefix.',
        'Bullet shape with author + ticket:    `- Mark Pottie: MAI-13 short summary`',
        'Bullet shape with author, no ticket:  `- Mark Pottie: short summary`',
        'Bullet shape with neither (rare):     `- short summary`',
        'Indent continuation lines with a single tab character.',
        'Deduplicate entries that describe the same change.',
        'Drop "Bumped version to X" entries, merge commits, and "fixing merge conflicts" entries entirely.',
        'If a version has no meaningful commits AND the existing block is empty, omit the section entirely.'
      ]
    : [
        'Strip MAI-XXX ticket prefixes.',
        'Strip author names — no "vsmsh:", "Mark:", etc.',
        'Use end-user voice (past tense, customer-facing). Rewrite vague subjects when sub-bullets make the change clearer; otherwise omit the entry.',
        'Deduplicate entries that describe the same change.',
        'Drop "Bumped version to X" entries, merge commits, internal refactor noise, and anything not user-visible.',
        'If a version has nothing user-visible, omit the section entirely.'
      ];

  const consolidationExample = [
    'CONSOLIDATION EXAMPLE (critical — do this every time):',
    'If versions 5.11.0, 5.11.1, 5.11.2 were all bumped on 25 April 2026 with these commits:',
    '  5.11.0: "Add pull-request flag handling"',
    '  5.11.1: "Return user to original branch after release"',
    '  5.11.2: (no new commits — bump only)',
    'Then output ONE section with the latest patch as the header:',
    '## 5.11.2',
    isInternal ? '25 April 2026 (Saturday)' : '25 April 2026',
    '',
    isInternal
      ? '- vsmsh: MAI-11 Add pull-request flag handling\n- vsmsh: MAI-12 Return user to original branch after release'
      : '- Added pull-request flag handling.\n- The release workflow now returns to your original branch.',
    '',
    'Do NOT emit separate `## 5.11.0` and `## 5.11.1` sections in this case. Merge them.'
  ].join('\n');

  const systemContent = [
    'You are a changelog editor for the MAIASS git workflow tool.',
    'Return ONLY the cleaned changelog block(s) for the supplied minor version.',
    'No preamble, no explanation, no code fences, no markdown headings other than `## VERSION` lines.',
    '',
    'CANONICAL FORMAT (whitespace exact):',
    '## VERSION',
    `DATE_STRING — ${dateFormat}`,
    '',
    '- entry one',
    '\tcontinuation indented with a single tab',
    '- entry two',
    '',
    '## NEXT_VERSION',
    'NEXT_DATE_STRING',
    '...',
    '',
    'EVERY section MUST have a date line directly under the version header. If the existing block is missing a date, use the commit date provided for that version in the GIT COMMITS section (formatted as required above).',
    '',
    'GROUPING:',
    '- Within a minor (e.g. 5.12.x), if multiple patches were released on the same date, consolidate them into ONE section whose header is the LATEST patch number for that date, and merge their entries (deduped).',
    '- Different dates within the same minor stay as separate sections, newest date first.',
    '',
    consolidationExample,
    '',
    `STYLE (${style}):`,
    ...styleRules.map(r => `- ${r}`),
    '',
    'If after applying these rules the entire minor group has zero remaining sections, return an empty string.'
  ].join('\n');

  // Existing block
  const existingText = group.sections.map(s => {
    const date = s.dateLine ? `\n${s.dateLine}` : '';
    return `## ${s.version}${date}\n\n${s.body.join('\n')}`.trim();
  }).join('\n\n') || '(no existing entries for this minor)';

  // Git commits per version, with the commit date so the AI can fill missing date lines.
  const commitsText = group.versions.map(v => {
    const commits = commitsByVersion.get(v) || [];
    const dateHint = commitDateByVersion.get(v);
    const header = dateHint ? `### ${v}  (bumped ${dateHint})` : `### ${v}`;
    if (commits.length === 0) return `${header}\n(no content commits in git; this version was a bump-only release)`;
    const lines = commits.map(c => `- ${c.author}: ${c.body.replace(/\n/g, '\n  ')}`);
    return `${header}\n${lines.join('\n')}`;
  }).join('\n\n');

  const userContent = [
    `MINOR VERSION GROUP: ${group.minor}.x`,
    `Versions (newest first): ${group.versions.join(', ')}`,
    '',
    'EXISTING CHANGELOG BLOCK (may be empty, malformed, or missing dates):',
    '---',
    existingText,
    '---',
    '',
    'GIT COMMITS PER VERSION (authoritative — use to backfill missing/empty sections; use the bumped date when the existing block lacks one):',
    '---',
    commitsText,
    '---',
    '',
    'Return the cleaned block(s) for this minor group only.'
  ].join('\n');

  return { systemContent, userContent };
}

/**
 * Single AI call. Mirrors the shape used by getAICommitSuggestion in
 * commit.js, but with cleanup-appropriate max_tokens. Throws on any
 * failure so the caller can roll back.
 *
 * Updates MAIASS_CREDITS_REMAINING on every successful response so the
 * pipeline-end credits readout picks up cleanup spend.
 */
async function callCleanupAI(systemContent, userContent) {
  const token = await createAnonymousSubscriptionIfNeeded();
  if (!token) {
    throw new Error('No MAIASS AI token available — cleanup needs an AI subscription. Run `maiass --account-info` for details.');
  }

  const aiHost = process.env.MAIASS_AI_HOST || 'https://pound.maiass.net';
  const aiPath = process.env.MAIASS_AI_PATH || '/proxy';
  const aiEndpoint = aiHost + aiPath;
  // Cleanup is much more instruction-sensitive than commit message generation.
  // gpt-3.5-turbo (the commit default) consistently bungles the consolidation
  // rule and hallucinates "Author Name" / "MAI-XXX" placeholder strings, so we
  // auto-pick a stronger model based on input size. User override wins.
  const inputBytes = Buffer.byteLength(systemContent + userContent, 'utf8');
  const aiModel = process.env.MAIASS_AI_CHANGELOG_MODEL
    || (inputBytes > 8 * 1024 ? 'gpt-4o' : 'gpt-4o-mini');
  const aiTemperature = parseFloat(process.env.MAIASS_AI_TEMPERATURE || '0.7');
  const timeoutMs = parseInt(process.env.MAIASS_AI_TIMEOUT || '30', 10) * 1000;

  if (process.env.MAIASS_DEBUG === 'true') {
    log.debug(SYMBOLS.INFO, `[cleanup] model=${aiModel} input=${inputBytes}B`);
  }

  const requestBody = {
    model: aiModel,
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: userContent }
    ],
    max_tokens: MAX_OUTPUT_TOKENS,
    temperature: aiTemperature
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(aiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Machine-Fingerprint': generateMachineFingerprint(),
        'X-Client-Name': getClientName(),
        'X-Client-Version': getClientVersion(),
        'X-Subscription-ID': process.env.MAIASS_SUBSCRIPTION_ID || ''
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`AI request timed out after ${timeoutMs / 1000}s`);
    }
    throw err;
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`AI API ${response.status} ${response.statusText}${errText ? `: ${errText.slice(0, 200)}` : ''}`);
  }

  const data = await response.json();

  if (data.billing) {
    if (data.billing.credits_remaining !== undefined) {
      process.env.MAIASS_CREDITS_REMAINING = String(data.billing.credits_remaining);
    }
    if (data.billing.warning) {
      log.warning(SYMBOLS.WARNING, data.billing.warning);
    }
  }

  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('AI response had no usable content');
  }

  return content.trim();
}

/**
 * AI-clean a single just-generated entry block during a version bump.
 * Used by lib/changelog.js as the inline resilience hook.
 *
 * Returns the cleaned bullet block (without the ## VERSION header or date —
 * those are added by the caller after this returns) or throws on failure.
 * The caller is expected to catch and fall back to the unprocessed entries.
 *
 * Intentionally small-scope: this is per-bump, runs every time the flag is
 * on, so we keep the prompt tight and the output a single section's worth
 * of bullets.
 */
export async function aiCleanSingleEntry({ entries, version, dateLine, style }) {
  const isInternal = style === 'internal';

  const styleRules = isInternal
    ? [
        'Preserve MAI-XXX ticket prefixes from the source. If a source entry has no ticket, do NOT invent one — just omit the prefix.',
        'Preserve the real author name from the source (e.g. "Mark Pottie", "vsmsh"). Do NOT use the literal string "Author Name", "AUTHOR", or any placeholder. If no author appears in the source, omit the author prefix.',
        'Shape with author + ticket: `- Mark Pottie: MAI-13 short summary`',
        'Shape with author only:     `- Mark Pottie: short summary`',
        'Shape with neither:         `- short summary`',
        'Indent continuation lines with a single tab character.',
        'Deduplicate entries that describe the same change.',
        'Drop "Bumped version to X" and merge-commit entries.'
      ]
    : [
        'Strip MAI-XXX ticket prefixes.',
        'Strip author names.',
        'Use end-user voice (past tense, customer-facing).',
        'Deduplicate. Rewrite vague subjects when sub-bullets clarify the change; otherwise omit them.',
        'Drop "Bumped version to X" and merge-commit entries.'
      ];

  const systemContent = [
    'You are a changelog editor for the MAIASS git workflow tool.',
    `You are cleaning the bullets for ONE section: version ${version}, dated ${dateLine}.`,
    'Return ONLY the cleaned bullet list — no `## VERSION` header, no date line, no preamble, no code fences.',
    'If after applying the rules there is nothing to say, return an empty string.',
    '',
    'FORMAT:',
    '- entry one',
    '\tcontinuation indented with a single tab',
    '- entry two',
    '',
    `STYLE (${style}):`,
    ...styleRules.map(r => `- ${r}`)
  ].join('\n');

  const userContent = [
    `Version: ${version}`,
    `Date: ${dateLine}`,
    '',
    'DRAFT BULLETS (from MAIASS regex formatter — may be ugly or duplicated):',
    '---',
    entries,
    '---',
    '',
    'Return only the cleaned bullets.'
  ].join('\n');

  return await callCleanupAI(systemContent, userContent);
}

/**
 * Exported for lib/changelog.js so the bump pipeline can check the same
 * "AI mode is on" rule without duplicating the predicate.
 *
 * The parsing + grouping helpers are also exported so tests and tools can
 * inspect what the cleanup would do without invoking the AI.
 */
export { isAIModeActive, parseChangelog, groupByMinor, buildVersionCommitMap, consolidateSameDateSections };

/**
 * Ensure the listed paths are present in .gitignore. Idempotent — only
 * appends entries that aren't already there. Mirrors the first-run logic
 * in maiass.mjs so user-visible behaviour is consistent.
 */
function ensureGitignoreEntries(entries) {
  const gitignorePath = '.gitignore';
  let content = '';
  if (existsSync(gitignorePath)) {
    content = readFileSync(gitignorePath, 'utf8');
  }
  const missing = entries.filter(e => !content.split('\n').some(l => l.trim() === e));
  if (missing.length === 0) return;
  if (content && !content.endsWith('\n')) content += '\n';
  content += `\n# MAIASS changelog cleanup backups\n${missing.join('\n')}\n`;
  writeFileSync(gitignorePath, content, 'utf8');
}

/**
 * Process one changelog file end-to-end.
 *   - Returns true on success, false on failure (with .bak already restored).
 *   - On success, leaves the .bak in place for the caller's gitignore step.
 */
async function cleanupOneFile(filePath, style, versionMap) {
  if (!existsSync(filePath)) {
    log.info(SYMBOLS.INFO, `${path.basename(filePath)} does not exist — skipping`);
    return { processed: false, bakPath: null };
  }

  const bakPath = `${filePath}.bak`;
  copyFileSync(filePath, bakPath);
  log.info(SYMBOLS.INFO, `Wrote backup: ${bakPath}`);

  const original = await fs.readFile(filePath, 'utf8');
  let parsed;
  try {
    parsed = parseChangelog(original);
  } catch (err) {
    log.error(SYMBOLS.CROSS, `Failed to parse ${filePath}: ${err.message}`);
    copyFileSync(bakPath, filePath);
    return { processed: false, bakPath };
  }

  const groups = groupByMinor(parsed.sections, versionMap.ordered);
  if (groups.length === 0) {
    log.info(SYMBOLS.INFO, `${path.basename(filePath)} has no version sections and no git bumps — nothing to clean`);
    return { processed: true, bakPath };
  }

  log.info(SYMBOLS.INFO, `Cleaning ${groups.length} minor version group(s) in ${path.basename(filePath)}…`);

  const cleanedGroups = [];
  for (const group of groups) {
    const { systemContent, userContent } = buildChunkMessages(style, group, versionMap.byVersion, versionMap.dateByVersion);

    // Soft size guard. If a single chunk goes beyond the threshold we still
    // try it — overshoot is preferable to silently splitting and producing
    // mis-grouped output. We surface a debug log so it's visible.
    const inputBytes = Buffer.byteLength(systemContent + userContent, 'utf8');
    if (inputBytes > CHUNK_THRESHOLD_BYTES) {
      log.debug(SYMBOLS.INFO, `[cleanup] minor ${group.minor}.x chunk is ${inputBytes} bytes (> ${CHUNK_THRESHOLD_BYTES}); sending as-is`);
    }

    let cleaned;
    try {
      cleaned = await callCleanupAI(systemContent, userContent);
    } catch (err) {
      log.error(SYMBOLS.CROSS, `AI cleanup failed on ${group.minor}.x: ${err.message}`);
      copyFileSync(bakPath, filePath);
      log.warning(SYMBOLS.WARNING, `Restored ${path.basename(filePath)} from backup.`);
      return { processed: false, bakPath };
    }

    // Deterministic post-pass: the AI is told to consolidate same-date
    // sections into one (latest-patch-as-header), but it under-applies the
    // rule when same-date patches aren't adjacent in the version sequence
    // (observed: 5.12.7 and 5.12.13 both dated 13 May 2026 stayed as two
    // sections). The consolidator below merges them by parsed date —
    // mechanical and reliable, no AI discretion.
    const consolidated = consolidateSameDateSections(cleaned).trim();
    cleanedGroups.push(consolidated);
    log.success(SYMBOLS.CHECKMARK, `Cleaned ${group.minor}.x`);
  }

  const body = cleanedGroups.filter(Boolean).join('\n\n') + '\n';
  const final = parsed.header
    ? `${parsed.header}\n\n${body}`
    : body;

  await fs.writeFile(filePath, final, 'utf8');
  log.success(SYMBOLS.CHECKMARK, `Wrote cleaned ${path.basename(filePath)}`);
  return { processed: true, bakPath };
}

/**
 * Lightweight git-state helpers for the branch-safety guard. These use
 * spawnSync so we can capture stderr cleanly for the caller's logs.
 */
function gitOK(args) {
  const r = spawnSync('git', args, { encoding: 'utf8' });
  return { ok: r.status === 0, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}

function currentBranch() {
  const r = gitOK(['rev-parse', '--abbrev-ref', 'HEAD']);
  return r.ok ? r.stdout : null;
}

function workingTreeClean() {
  const r = gitOK(['status', '--porcelain']);
  return r.ok && r.stdout === '';
}

/**
 * Run the actual cleanup pipeline (file walk + AI calls). Returns
 * { ok, results } where ok reflects whether all files processed cleanly.
 * Separated out so the branch-safety wrapper can run it inside a try/finally
 * without duplicating the body.
 */
async function runCleanupPass(publicFile, internalFile, publicExists, internalExists) {
  const versionMap = buildVersionCommitMap();
  if (versionMap.ordered.length === 0) {
    log.warning(SYMBOLS.WARNING, 'No "Bumped version to X" commits found in git history. Backfill will be disabled — only formatting will run.');
  } else {
    log.info(SYMBOLS.INFO, `Found ${versionMap.ordered.length} versioned bump(s) in git history.`);
  }

  const results = [];
  if (publicExists) {
    results.push(await cleanupOneFile(publicFile, 'public', versionMap));
  }
  if (internalExists) {
    results.push(await cleanupOneFile(internalFile, 'internal', versionMap));
  }

  const bakNames = results
    .filter(r => r && r.bakPath)
    .map(r => path.basename(r.bakPath));
  if (bakNames.length) ensureGitignoreEntries(bakNames);

  return { ok: !results.some(r => !r.processed), results };
}

/**
 * Public entry point — invoked from maiass.mjs when --cleanup-changelogs is
 * supplied. Exits the process with status 1 on hard failure so CI / scripts
 * can react.
 *
 * Branch safety: changelog cleanup writes to files that the version-bump
 * pipeline will prepend to next. If cleanup runs on a feature branch, the
 * feature branch's cleaned changelog drifts from develop's, and the next
 * develop bump produces a merge conflict that's awkward to resolve. So
 * cleanup is forced onto `$MAIASS_DEVELOPBRANCH` (default `develop`) — we
 * check it out, run, commit, and switch back. The switch is gated by a
 * confirmation prompt unless auto-approval is configured.
 */
export async function handleCleanupCommand() {
  if (!isAIModeActive()) {
    log.warning(SYMBOLS.WARNING, 'AI mode is off — cannot run changelog cleanup.');
    log.info(SYMBOLS.INFO, 'Set MAIASS_AI_MODE=ask or =ai_only and try again.');
    process.exit(1);
  }

  // Branch-safety preflight — required because cleanup modifies committed files.
  const insideRepo = gitOK(['rev-parse', '--is-inside-work-tree']).ok;
  if (!insideRepo) {
    log.error(SYMBOLS.CROSS, 'Not inside a git repository — cleanup requires git history for backfill.');
    process.exit(1);
  }
  const developBranch = process.env.MAIASS_DEVELOPBRANCH || 'develop';
  const origBranch = currentBranch();
  const onDevelop = origBranch === developBranch;

  if (!workingTreeClean()) {
    log.error(SYMBOLS.CROSS, 'Working tree has uncommitted changes — please commit, stash, or revert before running cleanup.');
    log.info(SYMBOLS.INFO, 'Cleanup writes to CHANGELOG.md / .CHANGELOG_internal.md, so we need a clean tree to keep the diff reviewable.');
    process.exit(1);
  }

  if (!onDevelop) {
    console.log('');
    console.log(colors.BYellow(`Cleanup must run on ${developBranch} (currently on ${origBranch}).`));
    console.log(colors.Gray(`  Running on a feature branch would create a changelog conflict at the next bump.`));
    console.log(colors.Gray(`  I will: checkout ${developBranch} → pull --ff-only → run cleanup → commit → switch back to ${origBranch}.`));
    const autoApprove = String(process.env.MAIASS_AUTO_APPROVE_AI_SUGGESTIONS || '').toLowerCase() === 'true';
    if (!autoApprove) {
      const answer = (await getSingleCharInput('Proceed? [Y/n] ')).toLowerCase();
      if (answer === 'n') {
        log.info(SYMBOLS.INFO, 'Aborted.');
        process.exit(0);
      }
    }

    const co = gitOK(['checkout', developBranch]);
    if (!co.ok) {
      log.error(SYMBOLS.CROSS, `Failed to checkout ${developBranch}: ${co.stderr}`);
      process.exit(1);
    }
    const pull = gitOK(['pull', '--ff-only', 'origin', developBranch]);
    if (!pull.ok) {
      log.warning(SYMBOLS.WARNING, `Could not fast-forward ${developBranch} from origin: ${pull.stderr}`);
      log.info(SYMBOLS.INFO, 'Continuing with local state — your cleanup may not reflect remote-only bumps.');
    }
  }

  const changelogDir = process.env.MAIASS_CHANGELOG_PATH || '.';
  const changelogName = process.env.MAIASS_CHANGELOG_NAME || 'CHANGELOG.md';
  const internalDir = process.env.MAIASS_CHANGELOG_INTERNAL_PATH || changelogDir;
  const internalName = process.env.MAIASS_CHANGELOG_INTERNAL_NAME || '.CHANGELOG_internal.md';

  const publicFile = path.join(changelogDir, changelogName);
  const internalFile = path.join(internalDir, internalName);

  const publicExists = existsSync(publicFile);
  const internalExists = existsSync(internalFile);

  if (!publicExists && !internalExists) {
    log.warning(SYMBOLS.WARNING, 'No changelog files found — nothing to do.');
    log.info(SYMBOLS.INFO, `Looked for: ${publicFile} and ${internalFile}`);
    if (!onDevelop) gitOK(['checkout', origBranch]);
    process.exit(0);
  }

  console.log('');
  console.log(colors.BCyan(`Changelog cleanup (on ${developBranch})`));
  console.log(colors.Gray('  Reads git history + existing changelog and rewrites in canonical format.'));
  console.log('');

  let pass;
  try {
    pass = await runCleanupPass(publicFile, internalFile, publicExists, internalExists);
  } catch (err) {
    log.error(SYMBOLS.CROSS, `Cleanup failed: ${err.message}`);
    if (!onDevelop) gitOK(['checkout', origBranch]);
    process.exit(1);
  }

  if (!pass.ok) {
    log.error(SYMBOLS.CROSS, 'One or more files failed; originals restored from .bak.');
    if (!onDevelop) gitOK(['checkout', origBranch]);
    process.exit(1);
  }

  // Commit the cleanup on develop. We include .gitignore in the candidate
  // set because ensureGitignoreEntries() may have added the .bak filenames
  // there — leaving that unstaged would block the post-cleanup checkout
  // back to the user's original branch.
  const candidates = ['.gitignore'];
  if (publicExists) candidates.push(publicFile);
  if (internalExists) candidates.push(internalFile);

  const status = gitOK(['status', '--porcelain', '--', ...candidates]);
  const hasChanges = status.ok && status.stdout !== '';
  if (hasChanges) {
    const add = gitOK(['add', ...candidates]);
    if (!add.ok) {
      log.warning(SYMBOLS.WARNING, `git add failed: ${add.stderr} — leaving changes uncommitted on ${developBranch}.`);
    } else {
      const commit = gitOK(['commit', '-m', 'chore: changelog cleanup via --cleanup-changelogs']);
      if (!commit.ok) {
        log.warning(SYMBOLS.WARNING, `git commit failed: ${commit.stderr} — changes are staged on ${developBranch}.`);
      } else {
        log.success(SYMBOLS.CHECKMARK, `Committed cleanup on ${developBranch}.`);
        if (String(process.env.MAIASS_AUTO_PUSH_COMMITS || '').toLowerCase() === 'true') {
          const push = gitOK(['push', 'origin', developBranch]);
          if (!push.ok) {
            log.warning(SYMBOLS.WARNING, `git push failed: ${push.stderr} — push manually when ready.`);
          } else {
            log.success(SYMBOLS.CHECKMARK, `Pushed cleanup to origin/${developBranch}.`);
          }
        } else {
          log.info(SYMBOLS.INFO, `Push when ready: git push origin ${developBranch}`);
        }
      }
    }
  } else {
    log.info(SYMBOLS.INFO, 'No changelog content changed — nothing to commit.');
  }

  // Return to the user's original branch.
  if (!onDevelop) {
    const back = gitOK(['checkout', origBranch]);
    if (!back.ok) {
      log.warning(SYMBOLS.WARNING, `Failed to checkout back to ${origBranch}: ${back.stderr}`);
    } else {
      log.success(SYMBOLS.CHECKMARK, `Returned to ${origBranch}.`);
    }
  }

  if (process.env.MAIASS_CREDITS_REMAINING) {
    console.log('');
    log.info(SYMBOLS.INFO, `Credits remaining: ${process.env.MAIASS_CREDITS_REMAINING}`);
  }
  console.log('');
  log.success(SYMBOLS.CHECKMARK, 'Changelog cleanup complete.');
}

export default { handleCleanupCommand, FLAGS };
