import { describe, it, expect, vi, beforeEach } from 'vitest';
import { encryptBiometrics, decryptBiometrics } from './encryption';

describe('Biometric Encryption Utility', () => {
  const MOCK_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64 hex chars (32 bytes)
  
  beforeEach(() => {
    vi.stubEnv('BIOMETRIC_ENCRYPTION_KEY', MOCK_KEY);
  });

  it('should encrypt and decrypt correctly', () => {
    const originalText = JSON.stringify([0.1, 0.2, 0.3]);
    const encrypted = encryptBiometrics(originalText);
    
    expect(encrypted).not.toBe(originalText);
    expect(encrypted).toContain(':');
    
    const decrypted = decryptBiometrics(encrypted);
    expect(decrypted).toBe(originalText);
  });

  it('should return original text if key is missing', () => {
    vi.stubEnv('BIOMETRIC_ENCRYPTION_KEY', '');
    const text = 'some data';
    expect(encryptBiometrics(text)).toBe(text);
  });

  it('should return original text if decryption fails', () => {
    const text = 'not encrypted';
    expect(decryptBiometrics(text)).toBe(text);
  });

  it('should handle malformed encrypted data gracefully', () => {
    const malformed = 'iv:auth:data:extra';
    expect(decryptBiometrics(malformed)).toBe(malformed);
  });
});
