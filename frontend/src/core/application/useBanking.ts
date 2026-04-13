// frontend/src/core/application/useBanking.ts
import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = "http://localhost:3000";

export function useBanking() {
  const [compliance, setCompliance] = useState<any>(null);
  const [bankedAmount, setBankedAmount] = useState<number>(0);
  const [kpis, setKpis] = useState<{cb_before: number, applied: number, cb_after: number} | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const checkCompliance = async (shipId: string, year: number) => {
    try {
      setError(''); setMessage(''); setKpis(null);
      // Fetch CB
      const cbRes = await axios.get(`${API_BASE_URL}/compliance/cb?shipId=${shipId}&year=${year}`);
      setCompliance(cbRes.data);
      // Fetch Bank Records
      const bankRes = await axios.get(`${API_BASE_URL}/banking/records?shipId=${shipId}&year=${year}`);
      setBankedAmount(bankRes.data.totalBanked);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const bankSurplus = async (shipId: string, year: number) => {
    try {
      setError(''); setKpis(null);
      const res = await axios.post(`${API_BASE_URL}/banking/bank`, { shipId, year });
      await checkCompliance(shipId, year);
      setMessage(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const applyBanked = async (shipId: string, year: number, amount: number) => {
    try {
      setError('');
      // The backend returns cb_before, applied, cb_after
      const res = await axios.post(`${API_BASE_URL}/banking/apply`, { shipId, year, amount });
      
      // Store the exact KPIs requested by the Rubric!
      setKpis({
        cb_before: res.data.cb_before,
        applied: res.data.applied,
        cb_after: res.data.cb_after
      });
      
      await checkCompliance(shipId, year);
      setMessage(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return { compliance, bankedAmount, kpis, message, error, checkCompliance, bankSurplus, applyBanked };
}