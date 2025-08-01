// Machine fingerprinting for abuse prevention
// Generates stable device identifiers using hardware characteristics
// Excludes user-controllable elements like hostname

import os from 'os';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { logger } from './logger.js';

/**
 * Get CPU information for fingerprinting
 * @returns {string} CPU identifier string
 */
function getCpuInfo() {
  try {
    const cpus = os.cpus();
    if (cpus && cpus.length > 0) {
      const cpu = cpus[0];
      return `${cpu.model}-${cpu.speed}-${cpus.length}cores`;
    }
  } catch (error) {
    logger.debug('Could not get CPU info:', error.message);
  }
  return 'unknown-cpu';
}

/**
 * Get memory information for fingerprinting
 * @returns {string} Memory identifier string
 */
function getMemoryInfo() {
  try {
    const totalMem = Math.round(os.totalmem() / (1024 * 1024 * 1024)); // GB
    return `${totalMem}gb-ram`;
  } catch (error) {
    logger.debug('Could not get memory info:', error.message);
  }
  return 'unknown-ram';
}

/**
 * Get platform-specific hardware identifiers
 * @returns {string} Platform-specific hardware info
 */
function getPlatformHardwareInfo() {
  const platform = os.platform();
  
  try {
    switch (platform) {
      case 'darwin': // macOS
        try {
          // Get hardware UUID (requires admin on newer macOS, so fallback gracefully)
          const hwUuid = execSync('system_profiler SPHardwareDataType | grep "Hardware UUID" | awk \'{print $3}\'', 
            { encoding: 'utf8', timeout: 3000 }).trim();
          if (hwUuid && hwUuid !== '') {
            return hwUuid;
          }
        } catch (e) {
          // Fallback to system serial number
          try {
            const serial = execSync('system_profiler SPHardwareDataType | grep "Serial Number" | awk \'{print $4}\'', 
              { encoding: 'utf8', timeout: 3000 }).trim();
            if (serial && serial !== '') {
              return serial;
            }
          } catch (e2) {
            logger.debug('Could not get macOS hardware identifiers');
          }
        }
        break;
        
      case 'linux':
        try {
          // Try to get machine ID
          const machineId = execSync('cat /etc/machine-id 2>/dev/null || cat /var/lib/dbus/machine-id 2>/dev/null || echo ""', 
            { encoding: 'utf8', timeout: 3000 }).trim();
          if (machineId && machineId !== '') {
            return machineId;
          }
        } catch (e) {
          logger.debug('Could not get Linux machine ID');
        }
        break;
        
      case 'win32':
        try {
          // Get Windows machine GUID
          const machineGuid = execSync('reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid 2>nul | findstr MachineGuid', 
            { encoding: 'utf8', timeout: 3000 }).trim();
          if (machineGuid && machineGuid.includes('REG_SZ')) {
            const guid = machineGuid.split('REG_SZ')[1].trim();
            if (guid && guid !== '') {
              return guid;
            }
          }
        } catch (e) {
          logger.debug('Could not get Windows machine GUID');
        }
        break;
    }
  } catch (error) {
    logger.debug(`Platform hardware detection failed for ${platform}:`, error.message);
  }
  
  return `${platform}-${os.arch()}`;
}

/**
 * Generate a stable machine fingerprint for abuse prevention
 * Uses hardware characteristics that are stable but not user-controllable
 * @returns {string} Base64 encoded fingerprint hash
 */
export function generateMachineFingerprint() {
  try {
    const components = [
      getCpuInfo(),
      getMemoryInfo(),
      getPlatformHardwareInfo(),
      os.arch(),           // CPU architecture (x64, arm64, etc.)
      os.userInfo().username,  // Username (semi-stable, helps distinguish users on same machine)
      os.platform()        // Operating system
    ];
    
    // Check if we have sufficient hardware info for security
    const hasRealHardwareInfo = components[2] !== `${os.platform()}-${os.arch()}`;
    if (!hasRealHardwareInfo) {
      logger.warn('WARNING: Using fallback fingerprint - hardware detection failed');
      logger.warn('This may allow easier abuse. Consider checking system permissions.');
    }
    
    // Create a stable hash from all components
    const fingerprintData = components.join('|');
    const hash = crypto.createHash('sha256').update(fingerprintData).digest('base64');
    
    logger.debug('Machine fingerprint components:', {
      cpu: components[0],
      memory: components[1],
      hardware: components[2],
      arch: components[3],
      username: components[4],
      platform: components[5],
      hasRealHardwareInfo
    });
    
    return hash;
  } catch (error) {
    logger.error('Failed to generate machine fingerprint:', error.message);
    logger.warn('SECURITY WARNING: Using minimal fallback fingerprint');
    // Fallback fingerprint using basic system info
    const fallback = `${os.platform()}-${os.arch()}-${os.userInfo().username}-FALLBACK`;
    return crypto.createHash('sha256').update(fallback).digest('base64');
  }
}

/**
 * Get a shortened machine fingerprint for display/logging
 * @returns {string} First 12 characters of the fingerprint
 */
export function getShortFingerprint() {
  return generateMachineFingerprint().substring(0, 12);
}

/**
 * Validate that the current machine fingerprint matches a stored one
 * @param {string} storedFingerprint - Previously stored fingerprint
 * @returns {boolean} True if fingerprints match
 */
export function validateMachineFingerprint(storedFingerprint) {
  const currentFingerprint = generateMachineFingerprint();
  return currentFingerprint === storedFingerprint;
}
