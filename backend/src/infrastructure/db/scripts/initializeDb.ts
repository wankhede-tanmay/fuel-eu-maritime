// backend/src/infrastructure/db/scripts/initializeDb.ts
import { dbPool } from '../postgres';

const schema = `
  DROP TABLE IF EXISTS pool_members;
  DROP TABLE IF EXISTS pools;
  DROP TABLE IF EXISTS bank_entries;
  DROP TABLE IF EXISTS ship_compliance;
  DROP TABLE IF EXISTS routes;

  CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    route_id VARCHAR(50) UNIQUE NOT NULL,
    vessel_type VARCHAR(50) NOT NULL,
    fuel_type VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    ghg_intensity DECIMAL(10, 4) NOT NULL,
    fuel_consumption DECIMAL(15, 2) NOT NULL,
    distance DECIMAL(15, 2) NOT NULL,
    total_emissions DECIMAL(15, 2) NOT NULL,
    is_baseline BOOLEAN DEFAULT FALSE
  );

  CREATE TABLE ship_compliance (
    id SERIAL PRIMARY KEY,
    ship_id VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    cb_gco2eq DECIMAL(20, 2) NOT NULL
  );

  CREATE TABLE bank_entries (
    id SERIAL PRIMARY KEY,
    ship_id VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    amount_gco2eq DECIMAL(20, 2) NOT NULL
  );

  CREATE TABLE pools (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE pool_members (
    pool_id INTEGER REFERENCES pools(id),
    ship_id VARCHAR(50) NOT NULL,
    cb_before DECIMAL(20, 2) NOT NULL,
    cb_after DECIMAL(20, 2) NOT NULL,
    PRIMARY KEY (pool_id, ship_id)
  );

  -- Seed the initial 5 routes from the assignment
  INSERT INTO routes (route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline)
  VALUES 
    ('R001', 'Container', 'HFO', 2024, 91.0, 5000, 12000, 4500, TRUE),
    ('R002', 'BulkCarrier', 'LNG', 2024, 88.0, 4800, 11500, 4200, FALSE),
    ('R003', 'Tanker', 'MGO', 2024, 93.5, 5100, 12500, 4700, FALSE),
    ('R004', 'RoRo', 'HFO', 2025, 89.2, 4900, 11800, 4300, FALSE),
    ('R005', 'Container', 'LNG', 2025, 90.5, 4950, 11900, 4400, FALSE);
`;

async function init() {
  try {
    console.log("⏳ Initializing database...");
    await dbPool.query(schema);
    console.log("✅ Database initialized and seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error initializing database:", err);
    process.exit(1);
  }
}

init();