// frontend/src/core/ports/IPoolingService.ts
export interface AdjustedCB {
  shipId: string;
  cb_before: number;
}

export interface PoolResult {
  poolId: number;
  year: number;
  totalSum: number;
  members: { ship_id: string; cb_before: number; cb_after: number }[];
}

export interface IPoolingService {
  getAdjustedCBs(year: number): Promise<AdjustedCB[]>;
  createPool(shipIds: string[], year: number): Promise<PoolResult>;
}