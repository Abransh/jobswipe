/**
 * @fileoverview OAuth Token Encryption - Secure storage of OAuth provider tokens
 * @description AES-256-GCM encryption for OAuth access/refresh tokens
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Critical security component - encrypts OAuth tokens at rest
 */

import crypto from 'crypto';

// =============================================================================
// CONSTANTS
// =============================================================================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits for AES-GCM
const AUTH_TAG_LENGTH = 16; // 128 bits authentication tag
const SALT_LENGTH = 32; // 256 bits salt for key derivation
const KEY_LENGTH = 32; // 256 bits for AES-256
const PBKDF2_ITERATIONS = 100000; // OWASP recommended minimum

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Encrypted token data structure
 */
export interface EncryptedToken {
  encrypted: string; // Base64-encoded ciphertext
  iv: string; // Base64-encoded IV
  authTag: string; // Base64-encoded authentication tag
  salt: string; // Base64-encoded salt
}

// =============================================================================
// OAUTH TOKEN ENCRYPTION
// =============================================================================

/**
 * OAuth Token Encryption Service
 * Provides AES-256-GCM encryption/decryption for OAuth provider tokens
 */
export class OAuthTokenEncryption {
  private encryptionKey: Buffer;

  constructor(encryptionKey?: string) {
    const key = encryptionKey || process.env.OAUTH_TOKEN_ENCRYPTION_KEY;

    if (!key) {
      throw new Error(
        'OAUTH_TOKEN_ENCRYPTION_KEY environment variable is required for token encryption'
      );
    }

    if (key.length < 32) {
      throw new Error(
        'OAUTH_TOKEN_ENCRYPTION_KEY must be at least 32 characters long'
      );
    }

    // Derive encryption key using PBKDF2
    this.encryptionKey = this.deriveKey(key);
  }

  // =============================================================================
  // ENCRYPTION
  // =============================================================================

  /**
   * Encrypt OAuth token using AES-256-GCM
   * @param token OAuth access token or refresh token
   * @returns Encrypted token data
   */
  public encrypt(token: string): EncryptedToken {
    if (!token) {
      throw new Error('Token cannot be empty');
    }

    try {
      // Generate random IV (initialization vector)
      const iv = crypto.randomBytes(IV_LENGTH);

      // Generate random salt for key derivation
      const salt = crypto.randomBytes(SALT_LENGTH);

      // Derive encryption key with salt
      const derivedKey = this.deriveKeyWithSalt(this.encryptionKey, salt);

      // Create cipher
      const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

      // Encrypt token
      let encrypted = cipher.update(token, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Get authentication tag (for integrity verification)
      const authTag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        salt: salt.toString('base64'),
      };
    } catch (error) {
      throw new Error(`Failed to encrypt OAuth token: ${(error as Error).message}`);
    }
  }

  /**
   * Encrypt OAuth token to a single encoded string
   * Format: encrypted:iv:authTag:salt (all base64 encoded, colon separated)
   * @param token OAuth token to encrypt
   * @returns Single encoded string
   */
  public encryptToString(token: string): string {
    const encrypted = this.encrypt(token);
    return `${encrypted.encrypted}:${encrypted.iv}:${encrypted.authTag}:${encrypted.salt}`;
  }

  // =============================================================================
  // DECRYPTION
  // =============================================================================

  /**
   * Decrypt OAuth token using AES-256-GCM
   * @param encryptedToken Encrypted token data
   * @returns Decrypted token
   */
  public decrypt(encryptedToken: EncryptedToken): string {
    if (!encryptedToken.encrypted || !encryptedToken.iv || !encryptedToken.authTag || !encryptedToken.salt) {
      throw new Error('Invalid encrypted token data');
    }

    try {
      // Parse base64-encoded data
      const iv = Buffer.from(encryptedToken.iv, 'base64');
      const authTag = Buffer.from(encryptedToken.authTag, 'base64');
      const salt = Buffer.from(encryptedToken.salt, 'base64');

      // Derive encryption key with salt
      const derivedKey = this.deriveKeyWithSalt(this.encryptionKey, salt);

      // Create decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);

      // Set authentication tag for integrity verification
      decipher.setAuthTag(authTag);

      // Decrypt token
      let decrypted = decipher.update(encryptedToken.encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Failed to decrypt OAuth token: ${(error as Error).message}`);
    }
  }

  /**
   * Decrypt OAuth token from a single encoded string
   * Format: encrypted:iv:authTag:salt (all base64 encoded, colon separated)
   * @param encryptedString Single encoded string
   * @returns Decrypted token
   */
  public decryptFromString(encryptedString: string): string {
    if (!encryptedString || typeof encryptedString !== 'string') {
      throw new Error('Invalid encrypted string');
    }

    const parts = encryptedString.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted string format');
    }

    const [encrypted, iv, authTag, salt] = parts;

    return this.decrypt({
      encrypted,
      iv,
      authTag,
      salt,
    });
  }

  // =============================================================================
  // KEY DERIVATION
  // =============================================================================

  /**
   * Derive encryption key using PBKDF2
   * @param password Master password/key
   * @returns Derived encryption key
   */
  private deriveKey(password: string): Buffer {
    // Use a fixed salt for master key derivation
    // In production, this could be stored separately
    const fixedSalt = Buffer.from('JobSwipe-OAuth-Encryption-v1', 'utf8');

    return crypto.pbkdf2Sync(
      password,
      fixedSalt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      'sha256'
    );
  }

  /**
   * Derive encryption key with custom salt (for each token)
   * @param masterKey Master encryption key
   * @param salt Random salt
   * @returns Derived encryption key
   */
  private deriveKeyWithSalt(masterKey: Buffer, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      masterKey,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      'sha256'
    );
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Validate if string is a properly encrypted token
   * @param encryptedString Encrypted string to validate
   * @returns True if valid format
   */
  public isValidEncryptedString(encryptedString: string): boolean {
    if (!encryptedString || typeof encryptedString !== 'string') {
      return false;
    }

    const parts = encryptedString.split(':');
    if (parts.length !== 4) {
      return false;
    }

    // Validate base64 encoding of each part
    const [encrypted, iv, authTag, salt] = parts;

    try {
      Buffer.from(encrypted, 'base64');
      Buffer.from(iv, 'base64');
      Buffer.from(authTag, 'base64');
      Buffer.from(salt, 'base64');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a random encryption key (for initialization)
   * @returns Random 32-byte encryption key (hex encoded)
   */
  public static generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create OAuth Token Encryption service
 * @param encryptionKey Optional encryption key (uses env var if not provided)
 * @returns OAuth Token Encryption instance
 */
export function createOAuthTokenEncryption(encryptionKey?: string): OAuthTokenEncryption {
  return new OAuthTokenEncryption(encryptionKey);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Encrypt multiple OAuth tokens at once
 * @param tokens Object containing tokens to encrypt
 * @param encryption Encryption service instance
 * @returns Object with encrypted tokens
 */
export function encryptOAuthTokens(
  tokens: {
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
  },
  encryption: OAuthTokenEncryption
): {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
} {
  return {
    accessToken: encryption.encryptToString(tokens.accessToken),
    refreshToken: tokens.refreshToken ? encryption.encryptToString(tokens.refreshToken) : undefined,
    idToken: tokens.idToken ? encryption.encryptToString(tokens.idToken) : undefined,
  };
}

/**
 * Decrypt multiple OAuth tokens at once
 * @param encryptedTokens Object containing encrypted tokens
 * @param encryption Encryption service instance
 * @returns Object with decrypted tokens
 */
export function decryptOAuthTokens(
  encryptedTokens: {
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
  },
  encryption: OAuthTokenEncryption
): {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
} {
  return {
    accessToken: encryption.decryptFromString(encryptedTokens.accessToken),
    refreshToken: encryptedTokens.refreshToken
      ? encryption.decryptFromString(encryptedTokens.refreshToken)
      : undefined,
    idToken: encryptedTokens.idToken
      ? encryption.decryptFromString(encryptedTokens.idToken)
      : undefined,
  };
}

export default OAuthTokenEncryption;
