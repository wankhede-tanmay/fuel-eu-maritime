// backend/src/core/application/ComplianceUseCases.ts
import { IRouteRepository } from '../ports/IRouteRepository';
import { ComplianceCalculator } from '../domain/Compliance';
import { Pool } from 'pg'; // We'll temporarily use raw PG for speed, refactor to ports later if needed

export class ComplianceUseCases {
  constructor(
    private routeRepository: IRouteRepository,
    private dbPool: Pool 
  ) {}

// Rubric Requirement: GET /banking/records?shipId&year
  async getBankRecords(shipId: string, year: number): Promise<any> {
    const result = await this.dbPool.query(
      `SELECT SUM(amount_gco2eq) as total_banked FROM bank_entries WHERE ship_id = $1`,
      [shipId]
    );
    return {
      shipId,
      year,
      totalBanked: parseFloat(result.rows[0].total_banked || '0')
    };
  }

 // Rubric Requirement: GET /compliance/cb?shipId&year
  async computeAndStoreCB(shipId: string, year: number): Promise<any> {
    // 1. Check if the database ALREADY has a record for this ship/year
    const existingRecord = await this.dbPool.query(
      `SELECT cb_gco2eq FROM ship_compliance WHERE ship_id = $1 AND year = $2`,
      [shipId, year]
    );

    // If it exists (e.g., after applying banked energy), return the database value!
    if (existingRecord.rows.length > 0) {
      const cb = parseFloat(existingRecord.rows[0].cb_gco2eq);
      return {
        shipId,
        year,
        cb_gco2eq: cb,
        status: cb >= 0 ? 'Surplus' : 'Deficit'
      };
    }

    // 2. If it DOES NOT exist in the database, calculate it for the first time
    const route = await this.routeRepository.findById(shipId);
    if (!route) throw new Error("Route not found");

    const cb = ComplianceCalculator.calculateComplianceBalance(
      route.props.ghgIntensity, 
      route.props.fuelConsumption
    );

    // Store the initial calculation
    await this.dbPool.query(
      `INSERT INTO ship_compliance (ship_id, year, cb_gco2eq) 
       VALUES ($1, $2, $3) 
       ON CONFLICT DO NOTHING`,
      [shipId, year, cb]
    );

    return {
      shipId,
      year,
      cb_gco2eq: cb,
      status: cb >= 0 ? 'Surplus' : 'Deficit'
    };
  }

  // Rubric Requirement: POST /banking/bank
  async bankSurplus(shipId: string, year: number): Promise<any> {
    // First, check their current CB
    const compliance = await this.computeAndStoreCB(shipId, year);
    
    if (compliance.cb_gco2eq <= 0) {
      throw new Error("Cannot bank a deficit! CB must be strictly positive.");
    }

    // Insert into the bank ledger
    await this.dbPool.query(
      `INSERT INTO bank_entries (ship_id, year, amount_gco2eq) 
       VALUES ($1, $2, $3)`,
      [shipId, year, compliance.cb_gco2eq]
    );

    return {
      message: `Successfully banked ${compliance.cb_gco2eq.toFixed(2)} units for ${shipId}`,
      bankedAmount: compliance.cb_gco2eq
    };
  }
  // Rubric Requirement: POST /banking/apply
  async applyBankedSurplus(shipId: string, year: number, appliedAmount: number): Promise<any> {
    // 1. Get current compliance (must be a deficit to apply banked surplus)
    const compliance = await this.computeAndStoreCB(shipId, year);
    if (compliance.cb_gco2eq >= 0) {
      throw new Error("Ship is already in surplus. No need to apply banked energy.");
    }

    // 2. Check total banked available for this ship
    const bankResult = await this.dbPool.query(
      `SELECT SUM(amount_gco2eq) as total_banked FROM bank_entries WHERE ship_id = $1`,
      [shipId]
    );
    const totalBanked = parseFloat(bankResult.rows[0].total_banked || '0');

    // 3. Validate amounts
    if (appliedAmount > totalBanked) {
      throw new Error(`Insufficient banked surplus. You have ${totalBanked}, but tried to apply ${appliedAmount}`);
    }

    // 4. Deduct from bank (we add a negative entry for the ledger)
    await this.dbPool.query(
      `INSERT INTO bank_entries (ship_id, year, amount_gco2eq) VALUES ($1, $2, $3)`,
      [shipId, year, -Math.abs(appliedAmount)]
    );

    // 5. Update the ship's current compliance balance
    const newCb = parseFloat(compliance.cb_gco2eq) + appliedAmount;
    await this.dbPool.query(
      `UPDATE ship_compliance SET cb_gco2eq = $1 WHERE ship_id = $2 AND year = $3`,
      [newCb, shipId, year]
    );

    return {
      message: `Successfully applied ${appliedAmount} banked units.`,
      cb_before: compliance.cb_gco2eq,
      applied: appliedAmount,
      cb_after: newCb
    };
  }
}