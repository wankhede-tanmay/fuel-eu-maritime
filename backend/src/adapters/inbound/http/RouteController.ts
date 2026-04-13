// backend/src/adapters/inbound/http/RouteController.ts
import { Request, Response } from 'express';
import { RouteUseCases } from '../../../core/application/RouteUseCases';

export class RouteController {
  constructor(private routeUseCases: RouteUseCases) {}

  getAllRoutes = async (req: Request, res: Response): Promise<void> => {
    try {
      const routes = await this.routeUseCases.getAllRoutes();
      // Extract just the props to send clean JSON to the frontend
      res.json(routes.map(r => r.props));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch routes" });
    }
  };

  setBaseline = async (req: Request, res: Response): Promise<void> => {
    try {
      // Explicitly tell TypeScript this is a string
      const id = req.params.id as string; 
      
      if (!id) {
        res.status(400).json({ error: "Route ID is required" });
        return;
      }

      await this.routeUseCases.setBaseline(id);
      res.json({ message: `Route ${id} set as baseline successfully` });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getComparison = async (req: Request, res: Response): Promise<void> => {
    try {
      const comparison = await this.routeUseCases.getComparison();
      res.json(comparison);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}