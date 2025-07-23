import colors from './colors.js';
import { SYMBOLS } from './symbols.js';
import { runMaiassPipeline } from './maiass-pipeline.js';

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
    force
  } = args;
  
  // Extract version bump from positional arguments if provided
  let bumpType = versionBump;
  if (positionalArgs.length > 0 && !bumpType) {
    bumpType = positionalArgs[0];
  }
  
  // Default to 'patch' if no version bump specified and not commits-only
  if (!bumpType && !commitsOnly) {
    bumpType = 'patch';
  }
  
  console.log(colors.BCyan(`${SYMBOLS.GEAR} MAIASSNODE - Modular AI-Assisted Semantic Savant`));
  console.log();
  
  try {
    // Run the complete MAIASS pipeline
    const result = await runMaiassPipeline({
      commitsOnly,
      autoStage,
      versionBump: bumpType,
      dryRun,
      tag,
      force
    });
    
    if (result.success) {
      console.log();
      console.log(colors.BGreen(`${SYMBOLS.CHECKMARK} MAIASS workflow completed successfully!`));
      
      // Display summary if not commits-only
      if (!commitsOnly && result.versionResult && !result.versionResult.skipped) {
        console.log();
        console.log(colors.BCyan(`${SYMBOLS.INFO} Workflow Summary:`));
        console.log(`  ${colors.Gray('Phase:')} ${colors.White('Complete Pipeline')}`);
        if (result.versionResult.bumpType) {
          console.log(`  ${colors.Gray('Version Bump:')} ${colors.White(result.versionResult.bumpType)}`);
        }
        if (result.mergeResult && result.mergeResult.merged) {
          console.log(`  ${colors.Gray('Merge:')} ${colors.White('Completed')}`);
        }
      }
      
      console.log();
      console.log(colors.BBlue(`${SYMBOLS.INFO} Thank you for using MAIASSNODE!`));
    } else if (result.cancelled) {
      console.log(colors.BYellow(`${SYMBOLS.INFO} Workflow cancelled by user`));
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
