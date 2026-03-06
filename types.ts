
export enum Scope {
  Scope1 = 'Scope 1',
  Scope2 = 'Scope 2',
  Scope3 = 'Scope 3'
}

export interface EmissionData {
  year: number;
  month: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  uncertainty?: number;
}

export interface Supplier {
  id: string;
  name: string;
  industry: string;
  emissions: number; // CO₂e Units
  spend: number;
  dependencies: string[]; // supplier IDs
  contributionScore: number;
}

export interface ScenarioParameters {
  renewableEnergyPct: number;
  evFleetConversionPct: number;
  supplierEfficiencyImprovement: number;
  productionVolumeChange: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
