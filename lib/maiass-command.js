import { log, logger } from './logger.js';
import { SYMBOLS } from './symbols.js';
import { runMaiassPipeline } from './maiass-pipeline.js';
import { createAnonymousSubscriptionIfNeeded } from './commit.js';
import colors from './colors.js';

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
    silent
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
    // Create anonymous subscription if needed (matches bashmaiass behavior).
    // Skip in CI environments (GitHub Actions / any env with CI=true) — each runner
    // has a different virtual MAC/disk, so every run would generate a new machine
    // fingerprint and burn an anonymous subscription slot.
    const aiMode = process.env.MAIASS_AI_MODE || 'ask';
    const isCI = process.env.CI === 'true' || process.env.CI === '1';
    if (aiMode !== 'off' && !isCI) {
      await createAnonymousSubscriptionIfNeeded();
    }
    
    // Run the complete MAIASS pipeline
    const result = await runMaiassPipeline({
      commitsOnly,
      autoStage,
      versionBump: bumpType,
      versionBumpExplicit,
      dryRun,
      tag,
      force,
      silent
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
