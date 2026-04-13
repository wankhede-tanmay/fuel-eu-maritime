// backend/src/adapters/outbound/postgres/PostgresRouteRepository.ts
import { Pool } from 'pg';
import { IRouteRepository } from '../../../core/ports/IRouteRepository';
import { Route } from '../../../core/domain/Route';

export class PostgresRouteRepository implements IRouteRepository {
  constructor(private db: Pool) {}

  async findAll(): Promise<Route[]> {
    const result = await this.db.query('SELECT * FROM routes');
    return result.rows.map(row => new Route({
      id: row.id,
      routeId: row.route_id,
      vesselType: row.vessel_type,
      fuelType: row.fuel_type,
      year: row.year,
      ghgIntensity: row.ghg_intensity,
      fuelConsumption: row.fuel_consumption,
      distance: row.distance,
      totalEmissions: row.total_emissions,
      isBaseline: row.is_baseline
    }));
  }

  async findById(routeId: string): Promise<Route | null> {
    const result = await this.db.query('SELECT * FROM routes WHERE route_id = $1', [routeId]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return new Route({
        id: row.id,
        routeId: row.route_id,
        vesselType: row.vessel_type,
        fuelType: row.fuel_type,
        year: row.year,
        ghgIntensity: row.ghg_intensity,
        fuelConsumption: row.fuel_consumption,
        distance: row.distance,
        totalEmissions: row.total_emissions,
        isBaseline: row.is_baseline
    });
  }

  async setBaseline(routeId: string): Promise<void> {
    // First, remove baseline from all routes
    await this.db.query('UPDATE routes SET is_baseline = false');
    // Then, set the new baseline
    await this.db.query('UPDATE routes SET is_baseline = true WHERE route_id = $1', [routeId]);
  }

  async getBaseline(): Promise<Route | null> {
    const result = await this.db.query('SELECT * FROM routes WHERE is_baseline = true LIMIT 1');
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return new Route({
        id: row.id,
        routeId: row.route_id,
        vesselType: row.vessel_type,
        fuelType: row.fuel_type,
        year: row.year,
        ghgIntensity: row.ghg_intensity,
        fuelConsumption: row.fuel_consumption,
        distance: row.distance,
        totalEmissions: row.total_emissions,
        isBaseline: row.is_baseline
    });
  }

  async save(route: Route): Promise<void> {
    // For now, this is a placeholder if we need to insert new routes later
    const p = route.props;
    await this.db.query(
      `INSERT INTO routes (route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [p.routeId, p.vesselType, p.fuelType, p.year, p.ghgIntensity, p.fuelConsumption, p.distance, p.totalEmissions, p.isBaseline]
    );
  }
}