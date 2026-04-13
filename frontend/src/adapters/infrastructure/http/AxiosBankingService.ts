// frontend/src/adapters/infrastructure/http/AxiosBankingService.ts
import axios from "axios";
import type { IBankingService, ComplianceData } from "../../../core/ports/IBankingService";

const API_BASE_URL = "http://localhost:3000";

export class AxiosBankingService implements IBankingService {
  async getCompliance(shipId: string, year: number): Promise<ComplianceData> {
    const res = await axios.get(`${API_BASE_URL}/compliance/cb?shipId=${shipId}&year=${year}`);
    return res.data;
  }

  async bankSurplus(shipId: string, year: number): Promise<any> {
    const res = await axios.post(`${API_BASE_URL}/banking/bank`, { shipId, year });
    return res.data;
  }

  async applyBanked(shipId: string, year: number, amount: number): Promise<any> {
    const res = await axios.post(`${API_BASE_URL}/banking/apply`, { shipId, year, amount });
    return res.data;
  }
}

export const bankingService = new AxiosBankingService();