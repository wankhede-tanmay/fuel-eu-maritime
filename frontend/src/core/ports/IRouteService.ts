// frontend/src/core/ports/IRouteService.ts
import type { Route } from "../domain/Route";

export interface IRouteService {
  getAllRoutes(): Promise<Route[]>;
  getComparison(): Promise<Route[]>;
  setBaseline(routeId: string): Promise<void>;
}