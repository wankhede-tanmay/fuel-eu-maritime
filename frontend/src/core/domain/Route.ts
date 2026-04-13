// frontend/src/core/domain/Route.ts
export interface Route {
  id?: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
  percentDiff?: number;
  isCompliant?: boolean;
}