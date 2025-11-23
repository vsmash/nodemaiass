// Machine fingerprinting for abuse prevention
// Generates stable device identifiers using hardware characteristics
// Matches bashmaiass implementation: MAC|CPU|Disk|Kernel → SHA-256 hex

import os from 'os';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { logger } from './logger.js';

/**
 * Get MAC address for fingerprinting
 * @returns {string} MAC address of primary network interface
 */
function getMacAddress() {
  try {
    const platform = os.platform();
    
    if (platform === 'linux') {
      // Use ip command on Linux
      const result = execSync('ip link | awk \'/ether/ {print $2; exit}\'', 
        { encoding: 'utf8', timeout: 3000 }).trim();
      if (result && result !== '') {
        return result;
      }
    } else if (platform === 'darwin') {
      // macOS fallback using networksetup
      const result = execSync('networksetup -listallhardwareports | awk \'/Device|Ethernet Address/ { if ($1 == "Device:") dev=$2; else if ($1 == "Ethernet") { print $3; exit } }\'', 
        { encoding: 'utf8', timeout: 3000 }).trim();
      if (result && result !== '') {
        return result;
      }
    }
    
    // Fallback: try to get from network interfaces
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      if (iface) {
        for (const alias of iface) {
          if (!alias.internal && alias.mac && alias.mac !== '00:00:00:00:00:00') {
            return alias.mac;
          }
        }
      }
    }
  } catch (error) {
    logger.debug('Could not get MAC address:', error.message);
  }
  return 'unknown-mac';
}

/**
 * Get CPU information for fingerprinting
 * @returns {string} CPU brand string
 */
function getCpuInfo() {
  try {
    const platform = os.platform();
    
    if (platform === 'darwin') {
      // Use sysctl on macOS to match bashmaiass
      const result = execSync('sysctl -n machdep.cpu.brand_string', 
        { encoding: 'utf8', timeout: 3000 }).trim();
      if (result && result !== '') {
        return result;
      }
    } else if (platform === 'linux') {
      // Use /proc/cpuinfo on Linux
      const result = execSync('grep -m1 "model name" /proc/cpuinfo | cut -d ":" -f 2 | xargs', 
        { encoding: 'utf8', timeout: 3000 }).trim();
      if (result && result !== '') {
        return result;
      }
    }
    
    // Fallback to Node.js os.cpus()
    const cpus = os.cpus();
    if (cpus && cpus.length > 0) {
      return cpus[0].model;
    }
  } catch (error) {
    logger.debug('Could not get CPU info:', error.message);
  }
  return 'unknown-cpu';
}

/**
 * Get disk identifier for fingerprinting
 * @returns {string} Disk/volume identifier
 */
function getDiskIdentifier() {
  try {
    const platform = os.platform();
    
    if (platform === 'darwin') {
      // Get volume UUID on macOS
      const result = execSync('diskutil info / | awk -F": " \'/Volume UUID/ {print $2; exit}\'', 
        { encoding: 'utf8', timeout: 3000 }).trim();
      if (result && result !== '') {
        return result;
      }
    } else if (platform === 'linux') {
      // Get disk serial on Linux
      const rootDisk = execSync('df / | tail -1 | awk \'{print $1}\' | sed \'s/[0-9]*$//\'', 
        { encoding: 'utf8', timeout: 3000 }).trim();
      if (rootDisk) {
        const serial = execSync(`lsblk -no SERIAL "${rootDisk}" 2>/dev/null || echo "unknown-serial"`, 
          { encoding: 'utf8', timeout: 3000 }).trim();
        if (serial && serial !== '') {
          return serial;
        }
      }
    }
  } catch (error) {
    logger.debug('Could not get disk identifier:', error.message);
  }
  return 'unknown-disk';
}

/**
 * Get kernel information for fingerprinting
 * @returns {string} Kernel info (system, release, machine)
 */
function getKernelInfo() {
  try {
    // Use uname -srm to match bashmaiass
    const result = execSync('uname -srm', 
      { encoding: 'utf8', timeout: 3000 }).trim();
    if (result && result !== '') {
      return result;
    }
  } catch (error) {
    logger.debug('Could not get kernel info:', error.message);
  }
  
  // Fallback using Node.js os module
  return `${os.type()} ${os.release()} ${os.arch()}`;
}

/**
 * Generate a stable machine fingerprint for abuse prevention - V1 (LEGACY)
 * Algorithm: MAC|CPU|Disk|Kernel → SHA-256 hex
 * WARNING: Includes kernel version which changes on OS updates
 * @returns {string} SHA-256 hex fingerprint hash
 * @deprecated Use generateMachineFingerprint() (V2) instead
 */
export function generateMachineFingerprintV1() {
  try {
    const mac = getMacAddress();
    const cpu = getCpuInfo();
    const disk = getDiskIdentifier();
    const kernel = getKernelInfo();
    
    // V1: Includes kernel (causes issues on OS updates)
    const fingerprintInput = `${mac}|${cpu}|${disk}|${kernel}`;
    
    const hash = crypto.createHash('sha256').update(fingerprintInput).digest('hex');
    
    logger.debug('Machine fingerprint V1 components:', {
      mac: mac,
      cpu: cpu,
      disk: disk,
      kernel: kernel,
      input: fingerprintInput
    });
    
    return hash;
  } catch (error) {
    logger.error('Failed to generate machine fingerprint V1:', error.message);
    const fallback = `${os.platform()}-${os.arch()}-${os.userInfo().username}-FALLBACK`;
    return crypto.createHash('sha256').update(fallback).digest('hex');
  }
}

/**
 * Generate a stable machine fingerprint for abuse prevention - V2 (CURRENT)
 * Algorithm: MAC|CPU|Disk → SHA-256 hex (hardware-only, no kernel)
 * This version excludes kernel to prevent fingerprint changes on OS updates
 * Matches bashmaiass V2 implementation
 * @returns {string} SHA-256 hex fingerprint hash
 */
export function generateMachineFingerprint() {
  try {
    // Get hardware components only (no kernel)
    const mac = getMacAddress();
    const cpu = getCpuInfo();
    const disk = getDiskIdentifier();
    
    // V2: Hardware-only (no kernel version)
    // This prevents fingerprint changes on OS updates
    const fingerprintInput = `${mac}|${cpu}|${disk}`;
    
    // Generate SHA-256 hash in hex format to match bashmaiass
    const hash = crypto.createHash('sha256').update(fingerprintInput).digest('hex');
    
    logger.debug('Machine fingerprint V2 components:', {
      mac: mac,
      cpu: cpu,
      disk: disk,
      input: fingerprintInput,
      version: 'V2 (hardware-only)'
    });
    
    return hash;
  } catch (error) {
    logger.error('Failed to generate machine fingerprint V2:', error.message);
    logger.warn('SECURITY WARNING: Using minimal fallback fingerprint');
    const fallback = `${os.platform()}-${os.arch()}-${os.userInfo().username}-FALLBACK`;
    return crypto.createHash('sha256').update(fallback).digest('hex');
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
