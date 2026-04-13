// backend/tests/ComplianceUseCases.test.ts
import { ComplianceUseCases } from '../src/core/application/ComplianceUseCases';

// Mock the dependencies
const mockDbPool = {
  query: jest.fn(),
};
const mockRouteRepo = {
  findById: jest.fn(),
  findAll: jest.fn(),
};

describe('ComplianceUseCases (Fuel EU Article 20)', () => {
  let complianceUseCases: ComplianceUseCases;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // @ts-ignore - bypassing strict types for the mock
    // FIX: Put mockRouteRepo first, then mockDbPool to match your real class!
    complianceUseCases = new ComplianceUseCases(mockRouteRepo, mockDbPool);
  });

  describe('1. ComputeCB', () => {
    it('should calculate a positive CB (Surplus) for a clean ship', async () => {
      // Mock the route lookup (clean ship, GHG = 80 < Target 89.3368)
      mockRouteRepo.findById.mockResolvedValue({
        props: { ghgIntensity: '80', fuelConsumption: 1000 }
      });
      // Mock that it doesn't exist in DB yet
      mockDbPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await complianceUseCases.computeAndStoreCB('R002', 2024);
      
      expect(result.status).toBe('Surplus');
      expect(result.cb_gco2eq).toBeGreaterThan(0);
      expect(mockDbPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO ship_compliance'),
        expect.any(Array)
      );
    });

    it('should handle the Negative CB Edge Case (Deficit) for a dirty ship', async () => {
      // Mock the route lookup (dirty ship, GHG = 100 > Target 89.3368)
      mockRouteRepo.findById.mockResolvedValue({
        props: { ghgIntensity: '100', fuelConsumption: 1000 }
      });
      mockDbPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await complianceUseCases.computeAndStoreCB('R001', 2024);
      
      expect(result.status).toBe('Deficit');
      expect(result.cb_gco2eq).toBeLessThan(0);
    });
  });

  describe('2. ApplyBanked (Edge Cases)', () => {
    it('should throw an error if trying to over-apply bank (Edge Case)', async () => {
      // Mock the DB to say the ship has a deficit (so it passes the first check)
      mockDbPool.query.mockResolvedValueOnce({ rows: [{ cb_gco2eq: '-100000' }] });
      
      // Mock the DB to say the ship only has 50,000 in the bank
      mockDbPool.query.mockResolvedValueOnce({ rows: [{ total_banked: '50000' }] });
      
      // Try to apply 100,000 (which is > 50,000)
      await expect(
        complianceUseCases.applyBankedSurplus('R001', 2024, 100000)
      ).rejects.toThrow("Insufficient banked surplus. You have 50000, but tried to apply 100000");
    });

    it('should throw an error if trying to apply banked energy to a ship with a Surplus', async () => {
      // Mock the DB to show the ship currently has a positive balance (Surplus)
      mockDbPool.query.mockResolvedValueOnce({ rows: [{ cb_gco2eq: '100000' }] });
      
      await expect(
        complianceUseCases.applyBankedSurplus('R002', 2024, 10000)
      ).rejects.toThrow("Ship is already in surplus. No need to apply banked energy.");
    });
  });
});