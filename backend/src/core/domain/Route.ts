// backend/src/core/domain/Route.ts

export interface RouteProps {
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
}

export class Route {
  constructor(public readonly props: RouteProps) {}

  calculatePercentDifference(baselineIntensity: number): number {
    return ((this.props.ghgIntensity / baselineIntensity) - 1) * 100;
  }

  isCompliant(targetIntensity: number = 89.3368): boolean {
    return this.props.ghgIntensity <= targetIntensity;
  }
}