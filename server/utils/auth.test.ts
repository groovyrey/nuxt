import { describe, it, expect } from 'vitest';
import { euclideanDistance, compareManyToMany } from './auth';

describe('Biometric Comparison Logic', () => {
  it('should calculate euclidean distance correctly', () => {
    const a = [0, 0];
    const b = [3, 4];
    expect(euclideanDistance(a, b)).toBe(5);
  });

  it('should return Infinity for mismatched lengths', () => {
    expect(euclideanDistance([1], [1, 2])).toBe(Infinity);
  });

  it('should find the minimum distance in many-to-many comparison', () => {
    const inputs = [[0.1, 0.1], [0.9, 0.9]];
    const stored = [[0.15, 0.15], [0.85, 0.85]];
    
    // dist([0.1, 0.1], [0.15, 0.15]) = sqrt(0.05^2 + 0.05^2) approx 0.0707
    const dist = compareManyToMany(inputs, stored);
    expect(dist).toBeLessThan(0.08);
    expect(dist).toBeGreaterThan(0.07);
  });
});
