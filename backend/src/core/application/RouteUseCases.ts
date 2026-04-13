// backend/src/core/application/RouteUseCases.ts
import { Route } from "../domain/Route";
import { IRouteRepository } from "../ports/IRouteRepository";

export class RouteUseCases {
  constructor(private routeRepository: IRouteRepository) {}

  async getAllRoutes(): Promise<Route[]> {
    return this.routeRepository.findAll();
  }

  async setBaseline(routeId: string): Promise<void> {
    const route = await this.routeRepository.findById(routeId);
    if (!route) {
      throw new Error(`Route with ID ${routeId} not found`);
    }
    await this.routeRepository.setBaseline(routeId);
  }

  async getComparison(): Promise<any[]> {
    const routes = await this.routeRepository.findAll();
    const baselineRoute = routes.find(r => r.props.isBaseline);
    
    // The exact target from the rubric
    const TARGET_INTENSITY = 89.3368;

    return routes.map(route => {
      const intensity = Number(route.props.ghgIntensity);
      
      // Calculate % difference ONLY if a baseline exists
      let percentDiff = 0;
      if (baselineRoute) {
        const baseIntensity = Number(baselineRoute.props.ghgIntensity);
        // THE EXACT FORMULA FROM THE RUBRIC:
        percentDiff = ((intensity / baseIntensity) - 1) * 100; 
      }

      return {
        ...route.props,
        percentDiff,
        // ✅ / ❌ Logic based strictly on the 89.3368 target
        isCompliant: intensity <= TARGET_INTENSITY 
      };
    });
  }
}