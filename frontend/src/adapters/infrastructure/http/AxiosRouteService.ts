// frontend/src/adapters/infrastructure/http/AxiosRouteService.ts
import axios from "axios";
import type { Route } from "../../../core/domain/Route";
import type { IRouteService } from "../../../core/ports/IRouteService";

const API_BASE_URL = "http://localhost:3000";

export class AxiosRouteService implements IRouteService {
  async getAllRoutes(): Promise<Route[]> {
    const response = await axios.get(`${API_BASE_URL}/routes`);
    return response.data;
  }

  async getComparison(): Promise<Route[]> {
    const response = await axios.get(`${API_BASE_URL}/routes/comparison`);
    return response.data;
  }

  async setBaseline(routeId: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/routes/${routeId}/baseline`);
  }
}

// Export a single instance to use throughout our app
export const routeService = new AxiosRouteService();