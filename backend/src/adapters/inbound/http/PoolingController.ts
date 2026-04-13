// backend/src/adapters/inbound/http/PoolingController.ts
import { Request, Response } from 'express';
import { PoolingUseCases } from '../../../core/application/PoolingUseCases';

export class PoolingController {
  constructor(private poolingUseCases: PoolingUseCases) {}

  getAdjustedCBs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { year } = req.query;
      if (!year) {
        res.status(400).json({ error: "year is required" });
        return;
      }
      const data = await this.poolingUseCases.getAdjustedCBs(parseInt(year as string));
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  createPool = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shipIds, year } = req.body;
      const data = await this.poolingUseCases.createPool(shipIds, year);
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}