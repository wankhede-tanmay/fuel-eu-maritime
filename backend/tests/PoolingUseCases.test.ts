// backend/tests/PoolingUseCases.test.ts
import { PoolingUseCases } from '../src/core/application/PoolingUseCases';

// Mock the DB Pool
const mockDbPool = {
  query: jest.fn(),
};

describe('PoolingUseCases (Fuel EU Article 21)', () => {
  let poolingUseCases: PoolingUseCases;

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore - bypassing strict types for the mock
    poolingUseCases = new PoolingUseCases(mockDbPool);
  });

  describe('Pool Validation Rules', () => {
    it('should throw an error if trying to pool less than 2 ships', async () => {
      await expect(
        poolingUseCases.createPool(['R001'], 2024)
      ).rejects.toThrow("A pool must contain at least 2 ships.");
    });

    it('should throw an error if one of the ships is missing compliance data', async () => {
      // Mock the DB returning only 1 row, even though we asked for 2 ships
      mockDbPool.query.mockResolvedValueOnce({ rows: [{ ship_id: 'R001', cb_gco2eq: '100' }] });

      await expect(
        poolingUseCases.createPool(['R001', 'R002'], 2024)
      ).rejects.toThrow("One or more selected ships do not have compliance data for this year. Please check their compliance first.");
    });

    it('should throw an error if the total pool sum is negative', async () => {
      // Mock the DB returning a massive deficit and a tiny surplus
      mockDbPool.query.mockResolvedValueOnce({
        rows: [
          { ship_id: 'R001', cb_gco2eq: '-500' },
          { ship_id: 'R002', cb_gco2eq: '100' }
        ]
      });

      await expect(
        poolingUseCases.createPool(['R001', 'R002'], 2024)
      ).rejects.toThrow("Invalid Pool: Total pool CB must be ≥ 0. Current sum is -400.00");
    });
  });

  describe('Greedy Algorithm Allocation', () => {
    it('should successfully transfer surplus to deficits and save to DB', async () => {
      // Mock 1: The SELECT query returns our ship data
      mockDbPool.query.mockResolvedValueOnce({
        rows: [
          { ship_id: 'R001', cb_gco2eq: '-100' }, // Deficit
          { ship_id: 'R002', cb_gco2eq: '150' },  // Surplus
        ]
      });
      // Mock 2: The INSERT INTO pools query returns a pool ID
      mockDbPool.query.mockResolvedValueOnce({
        rows: [{ id: 99 }]
      });
      // Mock 3 & 4: The INSERT INTO pool_members queries
      mockDbPool.query.mockResolvedValueOnce({});
      mockDbPool.query.mockResolvedValueOnce({});

      const result = await poolingUseCases.createPool(['R001', 'R002'], 2024);

      // Verify the Math (Greedy Algorithm)
      expect(result.totalSum).toBe(50);
      
      // R002 (Surplus) should have given 100 away, leaving it with 50
      const ship2 = result.members.find((m: any) => m.ship_id === 'R002');
      expect(ship2.cb_before).toBe(150);
      expect(ship2.cb_after).toBe(50);

      // R001 (Deficit) should have received 100, leaving it at 0 (Safe!)
      const ship1 = result.members.find((m: any) => m.ship_id === 'R001');
      expect(ship1.cb_before).toBe(-100);
      expect(ship1.cb_after).toBe(0);

      // Verify Database was called to save the pool
      expect(mockDbPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO pools'),
        [2024]
      );
    });
  });
});