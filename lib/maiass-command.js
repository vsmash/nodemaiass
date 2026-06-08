import { log, logger } from './logger.js';
import { SYMBOLS } from './symbols.js';
import { runMaiassPipeline } from './maiass-pipeline.js';
import colors from './colors.js';

/**
 * Flags accepted by the default `maiass` workflow command.
 * These are also the "global" workflow flags, but they're listed here so the
 * validator (MAI-43) treats them as belonging to the workflow handler rather
 * than being declared in two places. maiass.mjs unions them with the always-
 * available flags (--help, --version, --account-info, --setup, etc.).
 */
export const FLAGS = [
  '--auto', '-a',
  // MAI-93: -uc / --unattended-commit is the UNATTENDED commit-only flag
  // (replaces the removed -ac / --auto-commit).
  '--unattended-commit', '-uc',
  // Interactive commit-only. -co is an alias of --commits-only (bash parity).
  '--commits-only', '-c', '-co',
  '--auto-stage',
  '--dry-run', '-d',
  '--force', '-f',
  '--silent', '-s',
  '--tag', '-t',
  // -m / --message <value>: supply the commit message verbatim, non-interactively
  // (MAI-XX node+bash parity). Bypasses AI + interactive prompt. Works with the
  // default workflow, commits-only (-c / -co), and unattended-commit (-uc).
  '--message', '-m',
];

/**
 * Handle the main MAIASS command
 * @param {Object} args - Command arguments from yargs
 */
export async function handleMaiassCommand(args) {
  const {
    _: positionalArgs,
    'commits-only': commitsOnly,
    'auto-stage': autoStage,
    'version-bump': versionBump,
    'dry-run': dryRun,
    tag,
    force,
    silent,
    // Verbatim commit message from -m/--message (MAI-XX). null when not supplied.
    message: providedMessage = null
  } = args;
  
  // Extract version bump from positional arguments if provided
  let bumpType = versionBump;
  if (positionalArgs.length > 0 && !bumpType) {
    bumpType = positionalArgs[0];
  }

  // Track whether the user explicitly requested a version bump
  const versionBumpExplicit = !!bumpType;

  // Default to 'patch' if no version bump specified and not commits-only
  if (!bumpType && !commitsOnly) {
    bumpType = 'patch';
  }
  
  logger.header('', 'MAIASS - Modular AI-Assisted Semantic Scribe');
  
  try {
    // Run the complete MAIASS pipeline
    const result = await runMaiassPipeline({
      commitsOnly,
      autoStage,
      versionBump: bumpType,
      versionBumpExplicit,
      dryRun,
      tag,
      force,
      silent,
      providedMessage
    });
    
    if (result.success) {
      // Success message already shown in pipeline
      
      // Display summary if not commits-only
      if (!commitsOnly && result.versionResult && !result.versionResult.skipped) {
        log.space();
        log.info(SYMBOLS.INFO, 'Workflow Summary:');
        log.indent(`${colors.Gray('Phase:')} ${colors.White('Complete Pipeline')}`);
        if (result.versionResult.bumpType) {
          log.indent(`${colors.Gray('Version Bump:')} ${colors.White(result.versionResult.bumpType)}`);
        }
        if (result.mergeResult && result.mergeResult.merged) {
          log.indent(`${colors.Gray('Merge:')} ${colors.White('Completed')}`);
        }
      }
      
      log.space();
      log.blue(SYMBOLS.INFO, 'Thank you for using MAIASS!');
    } else if (result.cancelled) {
      log.warning(SYMBOLS.INFO, 'Workflow cancelled by user');
    } else {
      console.error(colors.Red(`${SYMBOLS.CROSS} Workflow failed: ${result.error || 'Unknown error'}`));
      process.exit(1);
    }
    
  } catch (error) {
    console.error(colors.Red(`${SYMBOLS.CROSS} MAIASS command failed: ${error.message}`));
    if (process.env.MAIASS_DEBUG === 'true') {
      console.error(colors.Gray(error.stack));
    }
    process.exit(1);
  }
}
