import { log, logger } from './logger.js';
import colors from './colors.js';
import { SYMBOLS } from './symbols.js';
import {
  getCurrentVersion,
  detectVersionFiles,
  bumpVersion,
  updateVersionFiles,
  createVersionTag,
  validateVersion,
  parseVersion
} from './version-manager.js';
import { getSingleCharInput, getMultiLineInput } from './input-utils.js';

/**
 * Display current version information
 * @param {Object} versionInfo - Version information from getCurrentVersion
 */
function displayVersionInfo(versionInfo) {
  logger.header(SYMBOLS.INFO, 'Version Information');
  
  if (versionInfo.current) {
    console.log(`  ${colors.BWhite('Current Version:')} ${colors.BGreen(versionInfo.current)}`);
    console.log(`  ${colors.BWhite('Source:')} ${colors.White(versionInfo.source)}`);
  } else {
    console.log(`  ${colors.BYellow('No version detected')}`);
  }
  
  if (versionInfo.tagVersion && versionInfo.tagVersion !== versionInfo.current) {
    console.log(`  ${colors.BWhite('Latest Git Tag:')} ${colors.White(versionInfo.tagVersion)}`);
  }
  
  console.log();
  
  if (versionInfo.files.length > 0) {
    log.info(SYMBOLS.INFO, 'Version Files Found:');
    console.log();
    
    versionInfo.files.forEach((file, index) => {
      const icon = file.filename === 'package.json' ? '📦' : 
                   file.type === 'php' ? '🐘' : 
                   file.type === 'text' ? '📄' : '📋';
      
      console.log(`  ${index + 1}. ${icon} ${colors.BWhite(file.filename)}`);
      console.log(`     ${colors.Gray('Version:')} ${colors.White(file.currentVersion)}`);
      console.log(`     ${colors.Gray('Type:')} ${colors.White(file.type)}`);
      console.log(`     ${colors.Gray('Path:')} ${colors.Gray(file.path)}`);
      console.log();
    });
  } else {
    log.warning(SYMBOLS.WARNING, 'No version files detected');
    console.log();
    console.log(colors.Gray('  Supported files: package.json, composer.json, VERSION, version.txt'));
    console.log(colors.Gray('  WordPress: style.css, plugin.php, functions.php'));
    console.log();
  }
}

/**
 * Display version bump preview
 * @param {string} currentVersion - Current version
 * @param {string} newVersion - New version
 * @param {string} bumpType - Type of bump
 * @param {Array} files - Files that will be updated
 */
function displayBumpPreview(currentVersion, newVersion, bumpType, files) {
  log.info(SYMBOLS.INFO, 'Version Bump Preview:');
  console.log();
  
  console.log(`  ${colors.BWhite('Current:')} ${colors.White(currentVersion)}`);
  console.log(`  ${colors.BWhite('New:')} ${colors.BGreen(newVersion)}`);
  console.log(`  ${colors.BWhite('Bump Type:')} ${colors.White(bumpType)}`);
  console.log();
  
  if (files.length > 0) {
    log.info(SYMBOLS.INFO, 'Files to Update:');
    console.log();
    
    files.forEach((file, index) => {
      const icon = file.filename === 'package.json' ? '📦' : 
                   file.type === 'php' ? '🐘' : 
                   file.type === 'text' ? '📄' : '📋';
      
      console.log(`  ${index + 1}. ${icon} ${colors.BWhite(file.filename)} ${colors.Gray(`(${file.currentVersion} → ${newVersion})`)}`);
    });
    console.log();
  }
}

/**
 * Handle version bump operation
 * @param {string} bumpType - Type of bump (major, minor, patch, or specific version)
 * @param {Object} options - Command options
 */
async function handleVersionBump(bumpType, options) {
  const { dryRun, tag, tagMessage, force } = options;
  
  log.info(SYMBOLS.INFO, `${dryRun ? 'DRY RUN: ' : ''}Version Bump Operation`);
  console.log();
  
  // Get current version information
  const versionInfo = await getCurrentVersion();
  
  if (!versionInfo.current && !force) {
    console.error(colors.Red(`${SYMBOLS.CROSS} No current version detected`));
    console.log();
    log.warning(SYMBOLS.INFO, 'Use --force to create initial version');
    return;
  }
  
  // Determine new version
  let newVersion;
  if (versionInfo.current) {
    newVersion = bumpVersion(versionInfo.current, bumpType);
  } else {
    // No current version, check if bumpType is a specific version
    const validation = validateVersion(bumpType);
    if (validation.valid) {
      newVersion = bumpType;
    } else {
      newVersion = '1.0.0'; // Default initial version
    }
  }
  
  if (!newVersion) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Invalid bump type: ${bumpType}`));
    console.log();
    log.warning(SYMBOLS.INFO, 'Valid types: major, minor, patch, or specific version (e.g., 2.1.0)');
    return;
  }
  
  // Validate new version
  const validation = validateVersion(newVersion);
  if (!validation.valid) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Invalid version format: ${newVersion}`));
    console.log(colors.Red(`  ${validation.error}`));
    return;
  }
  
  // Display preview
  displayBumpPreview(versionInfo.current || '(none)', newVersion, bumpType, versionInfo.files);
  
  // Confirm operation unless dry run or force
  if (!dryRun && !force) {
    const confirm = await getSingleCharInput(colors.BCyan('Proceed with version bump? [Y/n] '));
    if (confirm === 'n') {
      log.warning(SYMBOLS.INFO, 'Version bump cancelled');
      return;
    }
  }
  
  // Update version files
  if (versionInfo.files.length > 0) {
    log.blue(SYMBOLS.INFO, `${dryRun ? 'Would update' : 'Updating'} version files...`);
    
    const updateResult = await updateVersionFiles(newVersion, versionInfo.files, dryRun);
    
    if (updateResult.success) {
      updateResult.updated.forEach(update => {
        log.success(SYMBOLS.CHECKMARK, `${update.file} ${colors.Gray(`(${update.oldVersion} → ${update.newVersion})`)}`);
      });
      
      if (updateResult.failed.length > 0) {
        console.log();
        log.warning(SYMBOLS.WARNING, 'Some files failed to update:');
        updateResult.failed.forEach(failure => {
          console.log(colors.Red(`${SYMBOLS.CROSS} ${failure.file}: ${failure.error}`));
        });
      }
    } else {
      console.error(colors.Red(`${SYMBOLS.CROSS} Failed to update version files`));
      return;
    }
  } else {
    log.warning(SYMBOLS.WARNING, 'No version files to update');
  }
  
  // Create git tag if requested
  if (tag && !dryRun) {
    console.log();
    log.blue(SYMBOLS.INFO, 'Creating git tag...');
    
    const tagResult = await createVersionTag(newVersion, tagMessage);
    
    if (tagResult.success) {
      log.success(SYMBOLS.CHECKMARK, `Created tag: ${newVersion}`);
      if (tagResult.message) {
        console.log(colors.Gray(`  Message: ${tagResult.message}`));
      }
    } else {
      console.error(colors.Red(`${SYMBOLS.CROSS} Failed to create tag: ${tagResult.error}`));
    }
  } else if (tag && dryRun) {
    console.log();
    log.blue(SYMBOLS.INFO, `Would create git tag: ${newVersion}`);
    if (tagMessage) {
      console.log(colors.Gray(`  Message: ${tagMessage}`));
    }
  }
  
  console.log();
  if (dryRun) {
    log.success(SYMBOLS.CHECKMARK, 'Dry run completed successfully');
    log.blue(SYMBOLS.INFO, 'Run without --dry-run to apply changes');
  } else {
    log.success(SYMBOLS.CHECKMARK, `Version bump completed: ${versionInfo.current || '(none)'} → ${newVersion}`);
  }
}

/**
 * Handle version command
 * @param {Object} args - Command arguments from yargs
 */
export async function handleVersionCommand(args) {
  const {
    _: positionalArgs,
    'dry-run': dryRun,
    tag,
    'tag-message': tagMessage,
    force,
    current
  } = args;
  
  try {
    // If --current flag is used, just show current version info
    if (current) {
      const versionInfo = await getCurrentVersion();
      displayVersionInfo(versionInfo);
      return;
    }
    
    // If no positional arguments, show current version info
    if (positionalArgs.length === 0) {
      const versionInfo = await getCurrentVersion();
      displayVersionInfo(versionInfo);
      return;
    }
    
    // Get bump type from first positional argument
    const bumpType = positionalArgs[0];
    
    // Handle version bump
    await handleVersionBump(bumpType, {
      dryRun,
      tag,
      tagMessage,
      force
    });
    
  } catch (error) {
    console.error(colors.Red(`${SYMBOLS.CROSS} Version command failed: ${error.message}`));
    if (process.env.MAIASS_DEBUG === 'true') {
      console.error(colors.Gray(error.stack));
    }
  }
}
