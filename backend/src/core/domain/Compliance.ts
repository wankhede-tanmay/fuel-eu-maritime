// backend/src/core/domain/Compliance.ts

export const TARGET_INTENSITY_2025 = 89.3368; 
export const ENERGY_CONVERSION_FACTOR = 41000; 

export class ComplianceCalculator {
  static calculateEnergyInScope(fuelConsumption: number): number {
    return fuelConsumption * ENERGY_CONVERSION_FACTOR;
  }

  static calculateComplianceBalance(actualIntensity: number, fuelConsumption: number): number {
    const energyInScope = this.calculateEnergyInScope(fuelConsumption);
    return (TARGET_INTENSITY_2025 - actualIntensity) * energyInScope;
  }
}