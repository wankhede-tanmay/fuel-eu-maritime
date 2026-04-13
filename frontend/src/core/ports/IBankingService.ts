// frontend/src/core/ports/IBankingService.ts
export interface ComplianceData {
  shipId: string;
  year: number;
  cb_gco2eq: number;
  status: string;
}

export interface IBankingService {
  getCompliance(shipId: string, year: number): Promise<ComplianceData>;
  bankSurplus(shipId: string, year: number): Promise<any>;
  applyBanked(shipId: string, year: number, amount: number): Promise<any>;
}