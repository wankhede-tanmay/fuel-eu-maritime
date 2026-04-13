// backend/src/infrastructure/server/app.ts
import { PoolingUseCases } from '../../core/application/PoolingUseCases';
import { PoolingController } from '../../adapters/inbound/http/PoolingController';
import { ComplianceUseCases } from '../../core/application/ComplianceUseCases';
import { ComplianceController } from '../../adapters/inbound/http/ComplianceController';
import express from 'express';
import cors from 'cors';
import { dbPool } from '../db/postgres';
import { PostgresRouteRepository } from '../../adapters/outbound/postgres/PostgresRouteRepository';
import { RouteUseCases } from '../../core/application/RouteUseCases';
import { RouteController } from '../../adapters/inbound/http/RouteController';

const app = express();
app.use(cors());
app.use(express.json());

// --- Dependency Injection Wiring ---
// 1. Initialize the database adapter
const routeRepo = new PostgresRouteRepository(dbPool);

// 2. Inject repo into Use Cases
const routeUseCases = new RouteUseCases(routeRepo);

// 3. Inject Use Cases into Controller
const routeController = new RouteController(routeUseCases);

// --- Routes ---
app.get('/routes', routeController.getAllRoutes);
app.post('/routes/:id/baseline', routeController.setBaseline);
app.get('/routes/comparison', routeController.getComparison);

// 4. Initialize Compliance Use Cases & Controller
const complianceUseCases = new ComplianceUseCases(routeRepo, dbPool);
const complianceController = new ComplianceController(complianceUseCases);

// --- Compliance & Banking Routes ---
app.get('/compliance/cb', complianceController.getComplianceBalance);
app.post('/banking/bank', complianceController.bankSurplus);
app.post('/banking/apply', complianceController.applyBanked);
app.get('/banking/records', complianceController.getBankRecords);

// 5. Initialize Pooling Use Cases & Controller
const poolingUseCases = new PoolingUseCases(dbPool);
const poolingController = new PoolingController(poolingUseCases);

// --- Pooling Routes ---
app.get('/compliance/adjusted-cb', poolingController.getAdjustedCBs);
app.post('/pools', poolingController.createPool);
export {app};