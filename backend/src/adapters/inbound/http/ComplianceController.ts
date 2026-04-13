// backend/src/adapters/inbound/http/ComplianceController.ts
import { Request, Response } from 'express';
import { ComplianceUseCases } from '../../../core/application/ComplianceUseCases';

export class ComplianceController {
  constructor(private complianceUseCases: ComplianceUseCases) {}

  getBankRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shipId, year } = req.query;
      if (!shipId || !year) {
        res.status(400).json({ error: "shipId and year are required" });
        return;
      }
      const data = await this.complianceUseCases.getBankRecords(shipId as string, parseInt(year as string));
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getComplianceBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shipId, year } = req.query;
      if (!shipId || !year) {
        res.status(400).json({ error: "shipId and year are required query parameters" });
        return;
      }
      const data = await this.complianceUseCases.computeAndStoreCB(shipId as string, parseInt(year as string));
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  bankSurplus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shipId, year } = req.body;
      const data = await this.complianceUseCases.bankSurplus(shipId, year);
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  applyBanked = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shipId, year, amount } = req.body;
      const data = await this.complianceUseCases.applyBankedSurplus(shipId, year, amount);
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}