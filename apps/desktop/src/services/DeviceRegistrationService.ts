/**
 * @fileoverview Desktop App Device Registration Service
 * @description Manages device registration and identification
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { TokenStorageService } from './TokenStorageService';

// =============================================================================
// INTERFACES
// =============================================================================

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  appVersion: string;
  osVersion: string;
  architecture: string;
  fingerprint: string;
}

export interface DeviceFingerprint {
  cpuInfo: string;
  memoryInfo: string;
  diskInfo: string;
  networkInfo: string;
  displayInfo: string;
  platformInfo: string;
}

// =============================================================================
// DEVICE REGISTRATION SERVICE
// =============================================================================

export class DeviceRegistrationService {
  private tokenStorage: TokenStorageService;
  private cachedDeviceInfo: DeviceInfo | null = null;

  constructor() {
    this.tokenStorage = new TokenStorageService();
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    if (this.cachedDeviceInfo) {
      return this.cachedDeviceInfo;
    }

    try {
      let deviceId = await this.tokenStorage.getDeviceId();
      
      if (!deviceId) {
        deviceId = uuidv4();
        await this.tokenStorage.setDeviceId(deviceId);
      }

      const deviceInfo: DeviceInfo = {
        deviceId,
        deviceName: await this.getDeviceName(),
        platform: process.platform,
        deviceType: 'desktop',
        appVersion: app.getVersion(),
        osVersion: this.getOSVersion(),
        architecture: process.arch,
        fingerprint: await this.generateFingerprint()
      };

      this.cachedDeviceInfo = deviceInfo;
      return deviceInfo;
    } catch (error) {
      console.error('Failed to get device info:', error);
      throw new Error('Failed to get device information');
    }
  }

  /**
   * Register device with server
   */
  async registerDevice(deviceInfo?: DeviceInfo): Promise<boolean> {
    try {
      const info = deviceInfo || await this.getDeviceInfo();
      
      const response = await fetch('http://localhost:3000/api/auth/device/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(info),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Failed to register device:', error);
      return false;
    }
  }

  /**
   * Unregister device from server
   */
  async unregisterDevice(): Promise<boolean> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      
      const response = await fetch('http://localhost:3000/api/auth/device/unregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId: deviceInfo.deviceId }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Failed to unregister device:', error);
      return false;
    }
  }

  /**
   * Validate device registration
   */
  async validateDevice(): Promise<boolean> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      
      const response = await fetch('http://localhost:3000/api/auth/device/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          deviceId: deviceInfo.deviceId,
          fingerprint: deviceInfo.fingerprint 
        }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Failed to validate device:', error);
      return false;
    }
  }

  /**
   * Reset device registration
   */
  async resetDevice(): Promise<void> {
    try {
      await this.unregisterDevice();
      await this.tokenStorage.clearAll();
      this.cachedDeviceInfo = null;
    } catch (error) {
      console.error('Failed to reset device:', error);
      throw new Error('Failed to reset device registration');
    }
  }

  /**
   * Get device registration status
   */
  async getRegistrationStatus(): Promise<{
    isRegistered: boolean;
    deviceId: string | null;
    lastValidated: Date | null;
  }> {
    try {
      const deviceId = await this.tokenStorage.getDeviceId();
      const isRegistered = deviceId !== null;
      
      return {
        isRegistered,
        deviceId,
        lastValidated: null // Could be extended to track validation
      };
    } catch (error) {
      console.error('Failed to get registration status:', error);
      return {
        isRegistered: false,
        deviceId: null,
        lastValidated: null
      };
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Get device name
   */
  private async getDeviceName(): Promise<string> {
    try {
      const os = require('os');
      const hostname = os.hostname();
      const username = os.userInfo().username;
      
      return `${username}'s ${this.getPlatformDisplayName()} (${hostname})`;
    } catch (error) {
      console.error('Failed to get device name:', error);
      return `JobSwipe Desktop App (${this.getPlatformDisplayName()})`;
    }
  }

  /**
   * Get OS version
   */
  private getOSVersion(): string {
    try {
      const os = require('os');
      return `${os.type()} ${os.release()}`;
    } catch (error) {
      console.error('Failed to get OS version:', error);
      return 'Unknown';
    }
  }

  /**
   * Get platform display name
   */
  private getPlatformDisplayName(): string {
    switch (process.platform) {
      case 'win32':
        return 'Windows';
      case 'darwin':
        return 'macOS';
      case 'linux':
        return 'Linux';
      default:
        return 'Unknown';
    }
  }

  /**
   * Generate device fingerprint
   */
  private async generateFingerprint(): Promise<string> {
    try {
      const crypto = require('crypto');
      const os = require('os');
      
      const fingerprint: DeviceFingerprint = {
        cpuInfo: this.getCPUInfo(),
        memoryInfo: this.getMemoryInfo(),
        diskInfo: await this.getDiskInfo(),
        networkInfo: this.getNetworkInfo(),
        displayInfo: this.getDisplayInfo(),
        platformInfo: this.getPlatformInfo()
      };

      const fingerprintString = JSON.stringify(fingerprint);
      return crypto.createHash('sha256').update(fingerprintString).digest('hex');
    } catch (error) {
      console.error('Failed to generate fingerprint:', error);
      // Fallback fingerprint
      const crypto = require('crypto');
      const fallback = `${process.platform}-${process.arch}-${app.getVersion()}`;
      return crypto.createHash('sha256').update(fallback).digest('hex');
    }
  }

  /**
   * Get CPU information
   */
  private getCPUInfo(): string {
    try {
      const os = require('os');
      const cpus = os.cpus();
      
      if (cpus.length > 0) {
        const cpu = cpus[0];
        return `${cpu.model}-${cpus.length}cores`;
      }
      
      return 'unknown-cpu';
    } catch (error) {
      return 'unknown-cpu';
    }
  }

  /**
   * Get memory information
   */
  private getMemoryInfo(): string {
    try {
      const os = require('os');
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      
      return `${Math.round(totalMemory / 1024 / 1024 / 1024)}GB-${Math.round(freeMemory / 1024 / 1024 / 1024)}GB`;
    } catch (error) {
      return 'unknown-memory';
    }
  }

  /**
   * Get disk information
   */
  private async getDiskInfo(): Promise<string> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const appPath = app.getPath('exe');
      const stats = fs.statSync(appPath);
      
      return `${stats.size}-${stats.birthtime.getTime()}`;
    } catch (error) {
      return 'unknown-disk';
    }
  }

  /**
   * Get network information
   */
  private getNetworkInfo(): string {
    try {
      const os = require('os');
      const interfaces = os.networkInterfaces();
      
      const macAddresses: string[] = [];
      
      for (const interfaceName in interfaces) {
        const interfaceInfo = interfaces[interfaceName];
        if (interfaceInfo) {
          for (const info of interfaceInfo) {
            if (info.mac && info.mac !== '00:00:00:00:00:00') {
              macAddresses.push(info.mac);
            }
          }
        }
      }
      
      return macAddresses.sort().join('-');
    } catch (error) {
      return 'unknown-network';
    }
  }

  /**
   * Get display information
   */
  private getDisplayInfo(): string {
    try {
      const { screen } = require('electron');
      const displays = screen.getAllDisplays();
      
      const displayInfo = displays.map(display => 
        `${display.size.width}x${display.size.height}-${display.scaleFactor}`
      ).join('-');
      
      return displayInfo;
    } catch (error) {
      return 'unknown-display';
    }
  }

  /**
   * Get platform information
   */
  private getPlatformInfo(): string {
    try {
      const os = require('os');
      
      return `${os.platform()}-${os.arch()}-${os.release()}-${os.version()}`;
    } catch (error) {
      return `${process.platform}-${process.arch}-unknown-unknown`;
    }
  }

  /**
   * Clear cached device info
   */
  clearCache(): void {
    this.cachedDeviceInfo = null;
  }

  /**
   * Refresh device info
   */
  async refreshDeviceInfo(): Promise<DeviceInfo> {
    this.clearCache();
    return await this.getDeviceInfo();
  }
}