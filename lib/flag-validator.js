// Per-subcommand flag validation (MAI-43).
//
// Historically maiass.mjs maintained a single hardcoded list of "valid flags"
// and rejected anything else. That meant legitimate subcommand flags like
// `version --current` or `config --global` were rejected before reaching
// their handlers. MAI-39 patched the config case with a wholesale skip; this
// module generalises the fix while keeping typo rejection.
//
// Contract:
//   * Each subcommand handler exports a FLAGS array of the flags it accepts.
//   * The "always valid" set (help, version, account-info, setup) applies to
//     every command — these are the CLI's built-ins.
//   * A flag is rejected only if it isn't in the union of (always-valid +
//     active subcommand's FLAGS). The error names the offending flag and
//     suggests the closest match.

/**
 * Always-valid flags — recognised regardless of which subcommand is active.
 * Anything specific to one subcommand (e.g. --current for version) lives
 * in that subcommand's FLAGS export, not here.
 */
export const ALWAYS_VALID_FLAGS = [
  '--help', '-h',
  '--version', '-v',
  '--account-info',
  '--cleanup-changelogs',
  '--setup', '--bootstrap',
  // CI template one-shots — these short-circuit before subcommand dispatch
  '--create-gh-action',
  '--show-gl-excerpt',
  '--show-bb-excerpt',
];

/**
 * Compute Levenshtein distance between two strings. Tiny implementation —
 * we only ever compare short flag names so the O(n*m) cost is negligible.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,        // insertion
        prev[j] + 1,            // deletion
        prev[j - 1] + cost      // substitution
      );
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

/**
 * Find the closest flag suggestion for an unknown flag.
 * Returns null if no candidate is "close enough" (distance > 3 or > half the
 * shorter string's length).
 * @param {string} unknown
 * @param {string[]} candidates
 * @returns {string|null}
 */
export function suggestFlag(unknown, candidates) {
  let best = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = levenshtein(unknown, c);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  if (best === null) return null;
  // Reject suggestions that are too far away to be useful.
  const cutoff = Math.max(2, Math.floor(Math.min(unknown.length, best.length) / 2));
  if (bestDist > cutoff) return null;
  return best;
}

/**
 * Validate the argv flags for a given subcommand.
 * @param {string[]} args - The raw argv tail (process.argv.slice(2))
 * @param {string[]} subcommandFlags - FLAGS export from the active subcommand handler
 * @param {Set<number>} [ignoreIndices] - argv positions to skip entirely. Used
 *   for option VALUES that may legitimately start with '-' (e.g. the -m/--message
 *   value, where a caller might pass `-m "-- not a flag --"`). Without this, such
 *   a value token would be misread as an unknown flag and rejected.
 * @returns {{valid: true} | {valid: false, flag: string, suggestion: string|null, validFlags: string[]}}
 */
export function validateFlags(args, subcommandFlags = [], ignoreIndices = new Set()) {
  // Dedupe so callers don't have to worry about overlap between the always-
  // valid set and a subcommand's FLAGS (e.g. account-info also lists --json).
  const validFlags = Array.from(new Set([...ALWAYS_VALID_FLAGS, ...subcommandFlags]));
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (ignoreIndices.has(i)) continue;
    if (!arg.startsWith('-')) continue;
    // Support `--tag=value` form — only the name portion is validated.
    const flagName = arg.split('=')[0];
    if (validFlags.includes(flagName)) continue;
    return {
      valid: false,
      flag: arg,
      suggestion: suggestFlag(flagName, validFlags),
      validFlags,
    };
  }
  return { valid: true };
}
