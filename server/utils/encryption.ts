import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

/**
 * Encrypts a string using AES-256-GCM.
 * Requires BIOMETRIC_ENCRYPTION_KEY (32-byte hex string) in environment.
 */
export const encryptBiometrics = (text: string) => {
  const key = process.env.BIOMETRIC_ENCRYPTION_KEY;
  
  if (!key || key.length !== 64) {
    console.warn('BIOMETRIC_ENCRYPTION_KEY is missing or invalid. Biometrics may be vulnerable.');
    return text;
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (e) {
    console.error('Encryption error:', e);
    return text;
  }
};

/**
 * Decrypts a string using AES-256-GCM.
 */
export const decryptBiometrics = (encryptedData: string) => {
  const key = process.env.BIOMETRIC_ENCRYPTION_KEY;
  
  if (!key || !encryptedData.includes(':')) {
    return encryptedData;
  }

  try {
    const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');
    if (!ivHex || !authTagHex || !encryptedText) return encryptedData;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (e) {
    // If it's not encrypted or decryption fails, return as-is (graceful degradation)
    return encryptedData;
  }
};
