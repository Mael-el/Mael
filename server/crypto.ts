import crypto from 'crypto';

// Encryption key derived from an environment variable (or a default fallback for development)
const ENCRYPTION_KEY_SECRET = process.env.DB_ENCRYPTION_SECRET || 'sante-plus-secret-key-32-chars-long!';

// Ensure key is exactly 32 bytes for AES-256
const getEncryptionKey = (): Buffer => {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY_SECRET).digest();
};

/**
 * Hash a password using secure PBKDF2.
 */
export function hashPassword(password: string, saltInput?: string): { hash: string; salt: string } {
  const salt = saltInput || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Encrypt medical data using AES-256-GCM
 */
export function encryptData(data: string): { ciphertext: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(12); // 12 bytes for GCM
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let ciphertext = cipher.update(data, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  
  const tag = cipher.getAuthTag().toString('hex');
  
  return {
    ciphertext,
    iv: iv.toString('hex'),
    tag
  };
}

/**
 * Decrypt medical data using AES-256-GCM
 */
export function decryptData(ciphertext: string, ivHex: string, tagHex: string): string {
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    throw new Error('Decryption failed. Invalid key or corrupted data.');
  }
}

/**
 * Generate a cryptographically secure random token (e.g. for session IDs or transaction hashes)
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a SHA-256 hash of a string (for blockchain registration)
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
