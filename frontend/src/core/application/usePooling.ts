// frontend/src/core/application/usePooling.ts
import { useState, useEffect } from 'react';
import { poolingService } from '../../adapters/infrastructure/http/AxiosPoolingService';
import type { AdjustedCB, PoolResult } from '../ports/IPoolingService';

export function usePooling() {
  const [availableShips, setAvailableShips] = useState<AdjustedCB[]>([]);
  const [selectedShipIds, setSelectedShipIds] = useState<Set<string>>(new Set());
  const [poolResult, setPoolResult] = useState<PoolResult | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [year, setYear] = useState(2024);

  useEffect(() => {
    loadShips(year);
  }, [year]);

  const loadShips = async (targetYear: number) => {
    try {
      setError('');
      const data = await poolingService.getAdjustedCBs(targetYear);
      setAvailableShips(data);
      setSelectedShipIds(new Set()); // Reset selections on year change
      setPoolResult(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const toggleShip = (shipId: string) => {
    const newSelection = new Set(selectedShipIds);
    if (newSelection.has(shipId)) newSelection.delete(shipId);
    else newSelection.add(shipId);
    setSelectedShipIds(newSelection);
    setPoolResult(null); // Clear previous results if they change the pool
  };

  // Real-time UI Math calculation
  const selectedShipsData = availableShips.filter(s => selectedShipIds.has(s.shipId));
  const currentPoolSum = selectedShipsData.reduce((sum, ship) => sum + ship.cb_before, 0);
  
  // Rubric Rules: Must be >= 0, and need at least 2 ships to pool
  const isValidPool = currentPoolSum >= 0 && selectedShipIds.size >= 2;

  const createPool = async () => {
    try {
      setError(''); setMessage('');
      const result = await poolingService.createPool(Array.from(selectedShipIds), year);
      setPoolResult(result);
      setMessage(`Successfully created Pool #${result.poolId}!`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return {
    year, setYear, availableShips, selectedShipIds, toggleShip,
    currentPoolSum, isValidPool, createPool, poolResult, error, message
  };
}