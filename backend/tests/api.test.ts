// backend/tests/api.test.ts
import request from 'supertest';
import { app } from '../src/infrastructure/server/app';

// Globally mock the Postgres driver so we don't need a real database running for tests
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

import { Pool } from 'pg';
const mockPool = new Pool() as jest.Mocked<any>;

describe('Integration Tests (Supertest API Endpoints)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Banking Endpoints (Article 20)', () => {
    it('GET /compliance/cb - should return current compliance balance', async () => {
      // Mock the DB returning an existing surplus balance
      mockPool.query.mockResolvedValueOnce({ rows: [{ cb_gco2eq: '150.5' }] });

      const res = await request(app)
        .get('/compliance/cb')
        .query({ shipId: 'R002', year: 2024 });

      expect(res.status).toBe(200);
      expect(res.body.cb_gco2eq).toBe(150.5);
      expect(res.body.status).toBe('Surplus');
    });

    it('POST /banking/bank - should bank surplus energy successfully', async () => {
      // Mock checking current CB (Surplus)
      mockPool.query.mockResolvedValueOnce({ rows: [{ cb_gco2eq: '1000' }] });
      // Mock inserting into bank_entries
      mockPool.query.mockResolvedValueOnce({});

      const res = await request(app)
        .post('/banking/bank')
        .send({ shipId: 'R002', year: 2024 });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Successfully banked');
      expect(res.body.bankedAmount).toBe(1000);
    });

    it('POST /banking/apply - should apply banked energy to deficit', async () => {
      // Mock 1: Check current CB (Deficit)
      mockPool.query.mockResolvedValueOnce({ rows: [{ cb_gco2eq: '-500' }] });
      // Mock 2: Check total banked available
      mockPool.query.mockResolvedValueOnce({ rows: [{ total_banked: '1000' }] });
      // Mock 3: Insert negative entry into bank
      mockPool.query.mockResolvedValueOnce({});
      // Mock 4: Update ship_compliance
      mockPool.query.mockResolvedValueOnce({});

      const res = await request(app)
        .post('/banking/apply')
        .send({ shipId: 'R001', year: 2024, amount: 500 });

      expect(res.status).toBe(200);
      expect(res.body.applied).toBe(500);
      expect(res.body.cb_after).toBe(0); // -500 + 500 = 0
    });
  });

  describe('Pooling Endpoints (Article 21)', () => {
    it('POST /pools - should successfully create a pool via HTTP', async () => {
      // Mock 1: Fetch current CBs for selected ships
      mockPool.query.mockResolvedValueOnce({
        rows: [
          { ship_id: 'R001', cb_gco2eq: '-100' },
          { ship_id: 'R002', cb_gco2eq: '200' }
        ]
      });
      // Mock 2: Insert into pools returning ID
      mockPool.query.mockResolvedValueOnce({ rows: [{ id: 42 }] });
      // Mock 3 & 4: Insert into pool_members
      mockPool.query.mockResolvedValueOnce({});
      mockPool.query.mockResolvedValueOnce({});

      const res = await request(app)
        .post('/pools')
        .send({ shipIds: ['R001', 'R002'], year: 2024 });

      expect(res.status).toBe(200); // or 201 depending on your Express router
      expect(res.body.poolId).toBe(42);
      expect(res.body.totalSum).toBe(100);
    });
  });
});