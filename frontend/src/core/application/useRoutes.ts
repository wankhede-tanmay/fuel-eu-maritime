// frontend/src/core/application/useRoutes.ts
import { useState, useEffect } from 'react';
import { routeService } from '../../adapters/infrastructure/http/AxiosRouteService';
import type { Route } from '../domain/Route';

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      // We use getComparison to ensure we always have the latest baseline math
      const data = await routeService.getComparison(); 
      setRoutes(data);
    } catch (error) {
      console.error("Failed to load routes", error);
    } finally {
      setLoading(false);
    }
  };

  const setBaseline = async (routeId: string) => {
    try {
      await routeService.setBaseline(routeId);
      await loadRoutes(); // Automatically refresh the data!
    } catch (error) {
      console.error("Failed to set baseline", error);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  return { routes, loading, setBaseline };
}