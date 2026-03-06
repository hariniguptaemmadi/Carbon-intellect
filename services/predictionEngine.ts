
import { EmissionData, ScenarioParameters } from '../types';

export const predictFutureEmissions = (history: EmissionData[], forecastMonths: number = 6): EmissionData[] => {
  const lastMonth = history[history.length - 1];
  const lastIndex = history.length;
  const trend = (history[history.length - 1].total - history[0].total) / history.length;

  return Array.from({ length: forecastMonths }).map((_, i) => {
    const nextIndex = lastIndex + i + 1;
    const seasonality = Math.sin(nextIndex / 2) * 50; 
    const baseTotal = lastMonth.total + (trend * (i + 1)) + seasonality;
    const s1Ratio = lastMonth.scope1 / lastMonth.total;
    const s2Ratio = lastMonth.scope2 / lastMonth.total;
    const s3Ratio = lastMonth.scope3 / lastMonth.total;

    return {
      year: 2024,
      month: `Forecast ${i + 1}`,
      scope1: baseTotal * s1Ratio,
      scope2: baseTotal * s2Ratio,
      scope3: baseTotal * s3Ratio,
      total: baseTotal,
      uncertainty: 0.1 * (i + 1) 
    };
  });
};

/**
 * Monte Carlo Simulation for confidence-aware estimates.
 * Generates N samples for a given projection.
 */
export const runMonteCarlo = (baseEmissions: number, iterations: number = 1000): { min: number, max: number, mean: number, confidenceInterval: [number, number] } => {
  const results: number[] = [];
  const stdDev = baseEmissions * 0.15; // 15% standard deviation

  for (let i = 0; i < iterations; i++) {
    // Box-Muller transform for normal distribution
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    const standardNormal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    results.push(baseEmissions + standardNormal * stdDev);
  }

  results.sort((a, b) => a - b);
  return {
    min: results[0],
    max: results[results.length - 1],
    mean: results.reduce((a, b) => a + b, 0) / results.length,
    confidenceInterval: [results[Math.floor(iterations * 0.05)], results[Math.floor(iterations * 0.95)]]
  };
};

/**
 * Scenario Analysis Simulator
 */
export const simulateScenario = (baseData: EmissionData[], params: ScenarioParameters): EmissionData[] => {
  return baseData.map(d => {
    const s1 = d.scope1 * (1 - (params.evFleetConversionPct / 100) * 0.4) * (1 + params.productionVolumeChange / 100);
    const s2 = d.scope2 * (1 - (params.renewableEnergyPct / 100)) * (1 + params.productionVolumeChange / 100);
    const s3 = d.scope3 * (1 - (params.supplierEfficiencyImprovement / 100)) * (1 + params.productionVolumeChange / 100);
    
    return {
      ...d,
      scope1: s1,
      scope2: s2,
      scope3: s3,
      total: s1 + s2 + s3
    };
  });
};
