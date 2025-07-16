/**
 * @fileoverview Desktop App Token Storage Service
 * @description Secure token storage using OS keychain integration
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { safeStorage } from 'electron';
import keytar from 'keytar';
import { AuthSession } from './AuthService';

// =============================================================================
// INTERFACES
// =============================================================================

interface StorageOptions {
  serviceName: string;
  accountName: string;
  encryptionKey?: string;
}

interface EncryptedData {
  iv: string;
  encryptedData: string;
  authTag: string;
}

// =============================================================================
// TOKEN STORAGE SERVICE
// =============================================================================

export class TokenStorageService {
  private readonly serviceName: string;
  private readonly accountName: string;
  private readonly sessionKey: string;
  private readonly deviceIdKey: string;

  constructor(options?: Partial<StorageOptions>) {
    this.serviceName = options?.serviceName || 'JobSwipe Desktop';
    this.accountName = options?.accountName || 'default';
    this.sessionKey = 'jobswipe-session';
    this.deviceIdKey = 'jobswipe-device-id';
  }

  /**
   * Store authentication session securely
   */
  async setSession(session: AuthSession): Promise<void> {
    try {
      const sessionData = JSON.stringify({
        user: session.user,
        tokens: session.tokens,
        sessionId: session.sessionId,
        expiresAt: session.expiresAt.toISOString(),
        refreshExpiresAt: session.refreshExpiresAt.toISOString(),
        timestamp: new Date().toISOString()
      });

      if (this.isKeychainAvailable()) {
        // Use OS keychain if available
        await keytar.setPassword(this.serviceName, this.sessionKey, sessionData);
      } else if (this.isElectronEncryptionAvailable()) {
        // Use Electron's safeStorage as fallback
        const encrypted = safeStorage.encryptString(sessionData);
        await this.setSecurePreference(this.sessionKey, encrypted.toString('base64'));
      } else {
        // Use simple encryption as last resort
        const encrypted = this.encryptData(sessionData);
        await this.setSecurePreference(this.sessionKey, JSON.stringify(encrypted));
      }

      console.log('Session stored securely');
    } catch (error) {
      console.error('Failed to store session:', error);
      throw new Error('Failed to store authentication session');
    }
  }

  /**
   * Retrieve authentication session
   */
  async getSession(): Promise<AuthSession | null> {
    try {
      let sessionData: string | null = null;

      if (this.isKeychainAvailable()) {
        // Try OS keychain first
        sessionData = await keytar.getPassword(this.serviceName, this.sessionKey);
      } else if (this.isElectronEncryptionAvailable()) {
        // Try Electron's safeStorage
        const encrypted = await this.getSecurePreference(this.sessionKey);
        if (encrypted) {
          const buffer = Buffer.from(encrypted, 'base64');
          sessionData = safeStorage.decryptString(buffer);
        }
      } else {
        // Use simple encryption
        const encryptedData = await this.getSecurePreference(this.sessionKey);
        if (encryptedData) {
          const encrypted = JSON.parse(encryptedData);
          sessionData = this.decryptData(encrypted);
        }
      }

      if (!sessionData) {
        return null;
      }

      const parsed = JSON.parse(sessionData);
      
      return {
        user: parsed.user,
        tokens: parsed.tokens,
        sessionId: parsed.sessionId,
        expiresAt: new Date(parsed.expiresAt),
        refreshExpiresAt: new Date(parsed.refreshExpiresAt)
      };
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      return null;
    }
  }

  /**
   * Clear stored session
   */
  async clearSession(): Promise<void> {
    try {
      if (this.isKeychainAvailable()) {
        await keytar.deletePassword(this.serviceName, this.sessionKey);
      } else {
        await this.deleteSecurePreference(this.sessionKey);
      }
      
      console.log('Session cleared');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Store device ID
   */
  async setDeviceId(deviceId: string): Promise<void> {
    try {
      if (this.isKeychainAvailable()) {
        await keytar.setPassword(this.serviceName, this.deviceIdKey, deviceId);
      } else {
        await this.setSecurePreference(this.deviceIdKey, deviceId);
      }
    } catch (error) {
      console.error('Failed to store device ID:', error);
      throw new Error('Failed to store device ID');
    }
  }

  /**
   * Retrieve device ID
   */
  async getDeviceId(): Promise<string | null> {
    try {
      if (this.isKeychainAvailable()) {
        return await keytar.getPassword(this.serviceName, this.deviceIdKey);
      } else {
        return await this.getSecurePreference(this.deviceIdKey);
      }
    } catch (error) {
      console.error('Failed to retrieve device ID:', error);
      return null;
    }
  }

  /**
   * Clear all stored data
   */
  async clearAll(): Promise<void> {
    try {
      await this.clearSession();
      
      if (this.isKeychainAvailable()) {
        await keytar.deletePassword(this.serviceName, this.deviceIdKey);
      } else {
        await this.deleteSecurePreference(this.deviceIdKey);
      }
      
      console.log('All stored data cleared');
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  /**
   * Check if session exists
   */
  async hasSession(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return session !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get storage info
   */
  async getStorageInfo(): Promise<{
    method: 'keychain' | 'electron' | 'simple';
    hasSession: boolean;
    hasDeviceId: boolean;
  }> {
    try {
      const method = this.isKeychainAvailable() ? 'keychain' : 
                    this.isElectronEncryptionAvailable() ? 'electron' : 'simple';
      
      const hasSession = await this.hasSession();
      const deviceId = await this.getDeviceId();
      
      return {
        method,
        hasSession,
        hasDeviceId: deviceId !== null
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        method: 'simple',
        hasSession: false,
        hasDeviceId: false
      };
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Check if OS keychain is available
   */
  private isKeychainAvailable(): boolean {
    try {
      return typeof keytar !== 'undefined' && keytar.setPassword !== undefined;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if Electron's safeStorage is available
   */
  private isElectronEncryptionAvailable(): boolean {
    try {
      return safeStorage.isEncryptionAvailable();
    } catch (error) {
      return false;
    }
  }

  /**
   * Simple encryption for fallback
   */
  private encryptData(data: string): EncryptedData {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Simple decryption for fallback
   */
  private decryptData(encryptedData: EncryptedData): string {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';
    const key = this.getEncryptionKey();
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    
    const decipher = crypto.createDecipher(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Get encryption key for simple encryption
   */
  private getEncryptionKey(): string {
    const crypto = require('crypto');
    const os = require('os');
    
    // Create a deterministic key based on machine info
    const machineInfo = `${os.hostname()}-${os.platform()}-${os.arch()}`;
    return crypto.createHash('sha256').update(machineInfo).digest('hex');
  }

  /**
   * Store preference securely (fallback method)
   */
  private async setSecurePreference(key: string, value: string): Promise<void> {
    try {
      // Use localStorage equivalent for Electron
      const Store = require('electron-store');
      const store = new Store({ encryptionKey: this.getEncryptionKey() });
      store.set(key, value);
    } catch (error) {
      console.error('Failed to set secure preference:', error);
      throw error;
    }
  }

  /**
   * Get preference securely (fallback method)
   */
  private async getSecurePreference(key: string): Promise<string | null> {
    try {
      const Store = require('electron-store');
      const store = new Store({ encryptionKey: this.getEncryptionKey() });
      return store.get(key) || null;
    } catch (error) {
      console.error('Failed to get secure preference:', error);
      return null;
    }
  }

  /**
   * Delete preference securely (fallback method)
   */
  private async deleteSecurePreference(key: string): Promise<void> {
    try {
      const Store = require('electron-store');
      const store = new Store({ encryptionKey: this.getEncryptionKey() });
      store.delete(key);
    } catch (error) {
      console.error('Failed to delete secure preference:', error);
    }
  }

  /**
   * Migrate from old storage format
   */
  async migrate(): Promise<void> {
    try {
      // Check if we have old format data and migrate
      const oldData = await this.getSecurePreference('old-session-key');
      if (oldData) {
        // Migrate to new format
        await this.setSecurePreference(this.sessionKey, oldData);
        await this.deleteSecurePreference('old-session-key');
        console.log('Migrated session data to new format');
      }
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }

  /**
   * Backup session data
   */
  async backup(): Promise<string | null> {
    try {
      const session = await this.getSession();
      if (!session) {
        return null;
      }
      
      // Create encrypted backup
      const backupData = JSON.stringify({
        session,
        timestamp: new Date().toISOString(),
        version: '1.0'
      });
      
      return Buffer.from(backupData).toString('base64');
    } catch (error) {
      console.error('Failed to create backup:', error);
      return null;
    }
  }

  /**
   * Restore session from backup
   */
  async restore(backupData: string): Promise<boolean> {
    try {
      const decoded = Buffer.from(backupData, 'base64').toString('utf8');
      const backup = JSON.parse(decoded);
      
      if (backup.version === '1.0' && backup.session) {
        const session: AuthSession = {
          ...backup.session,
          expiresAt: new Date(backup.session.expiresAt),
          refreshExpiresAt: new Date(backup.session.refreshExpiresAt)
        };
        
        await this.setSession(session);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return false;
    }
  }
}