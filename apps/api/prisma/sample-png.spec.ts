import { solidGradientPng } from './sample-png.js';

describe('solidGradientPng', () => {
  it('writes a recognizable PNG signature and IHDR', () => {
    const buf = solidGradientPng(8, 4, [10, 20, 30], [40, 50, 60]);
    expect(buf.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(true);
    expect(buf.toString('ascii', 12, 16)).toBe('IHDR');
    expect(buf.length).toBeGreaterThan(40);
  });
});
