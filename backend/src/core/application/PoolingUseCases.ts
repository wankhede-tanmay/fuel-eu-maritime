// backend/src/core/application/PoolingUseCases.ts
import { Pool } from 'pg';

export class PoolingUseCases {
  constructor(private dbPool: Pool) {}

  // Get current CBs for all ships in a given year
  async getAdjustedCBs(year: number): Promise<any[]> {
    const res = await this.dbPool.query(
      `SELECT ship_id, cb_gco2eq FROM ship_compliance WHERE year = $1`,
      [year]
    );
    return res.rows.map(r => ({
      shipId: r.ship_id,
      cb_before: parseFloat(r.cb_gco2eq)
    }));
  }

  // Create a pool and run the greedy allocation
  async createPool(shipIds: string[], year: number): Promise<any> {
    if (!shipIds || shipIds.length < 2) {
      throw new Error("A pool must contain at least 2 ships.");
    }

    // 1. Fetch current CBs for the selected ships
    const placeholders = shipIds.map((_, i) => `$${i + 2}`).join(',');
    const query = `SELECT ship_id, cb_gco2eq FROM ship_compliance WHERE year = $1 AND ship_id IN (${placeholders})`;
    const res = await this.dbPool.query(query, [year, ...shipIds]);

    if (res.rows.length !== shipIds.length) {
      throw new Error("One or more selected ships do not have compliance data for this year. Please check their compliance first.");
    }

    let members = res.rows.map(r => ({
      ship_id: r.ship_id,
      cb_before: parseFloat(r.cb_gco2eq),
      cb_after: parseFloat(r.cb_gco2eq) // Starts equal to before
    }));

    // Rule 1: Sum(adjustedCB) >= 0
    const totalSum = members.reduce((sum, m) => sum + m.cb_before, 0);
    if (totalSum < 0) {
      throw new Error(`Invalid Pool: Total pool CB must be ≥ 0. Current sum is ${totalSum.toFixed(2)}`);
    }

    // Rule 2: Greedy Allocation - Sort DESC by CB (highest surplus first)
    members.sort((a, b) => b.cb_before - a.cb_before);

    let surpluses = members.filter(m => m.cb_after > 0);
    let deficits = members.filter(m => m.cb_after < 0);

    // Transfer surplus to deficits
    for (let def of deficits) {
      for (let sur of surpluses) {
        if (def.cb_after >= 0) break; // This deficit is fully covered
        if (sur.cb_after <= 0) continue; // This surplus is empty

        const amountNeeded = Math.abs(def.cb_after);
        const amountAvailable = sur.cb_after;
        const transfer = Math.min(amountNeeded, amountAvailable);

        def.cb_after += transfer;
        sur.cb_after -= transfer;
      }
    }

    // Rules 3 & 4: Safety Checks
    for (let m of members) {
      if (m.cb_before < 0 && m.cb_after < m.cb_before) throw new Error("Safety violation: Deficit ship exited worse!");
      if (m.cb_before > 0 && m.cb_after < 0) throw new Error("Safety violation: Surplus ship exited negative!");
    }

    // Insert the successful pool into the Database
    const poolRes = await this.dbPool.query(`INSERT INTO pools (year) VALUES ($1) RETURNING id`, [year]);
    const poolId = poolRes.rows[0].id;

    for (let m of members) {
      await this.dbPool.query(
        `INSERT INTO pool_members (pool_id, ship_id, cb_before, cb_after) VALUES ($1, $2, $3, $4)`,
        [poolId, m.ship_id, m.cb_before, m.cb_after]
      );
    }

    return { poolId, year, totalSum, members };
  }
}