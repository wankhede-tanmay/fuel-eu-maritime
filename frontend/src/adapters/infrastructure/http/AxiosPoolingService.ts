// frontend/src/adapters/infrastructure/http/AxiosPoolingService.ts
import axios from "axios";
import type { IPoolingService, AdjustedCB, PoolResult } from "../../../core/ports/IPoolingService";

const API_BASE_URL = "http://localhost:3000";

export class AxiosPoolingService implements IPoolingService {
  async getAdjustedCBs(year: number): Promise<AdjustedCB[]> {
    const res = await axios.get(`${API_BASE_URL}/compliance/adjusted-cb?year=${year}`);
    return res.data;
  }

  async createPool(shipIds: string[], year: number): Promise<PoolResult> {
    const res = await axios.post(`${API_BASE_URL}/pools`, { shipIds, year });
    return res.data;
  }
}

export const poolingService = new AxiosPoolingService();