
import { EmissionData, Supplier } from './types';

export const INITIAL_EMISSION_DATA: EmissionData[] = [
  { year: 2023, month: 'Jan', scope1: 450, scope2: 320, scope3: 1200, total: 1970 },
  { year: 2023, month: 'Feb', scope1: 420, scope2: 310, scope3: 1150, total: 1880 },
  { year: 2023, month: 'Mar', scope1: 460, scope2: 340, scope3: 1300, total: 2100 },
  { year: 2023, month: 'Apr', scope1: 480, scope2: 350, scope3: 1350, total: 2180 },
  { year: 2023, month: 'May', scope1: 500, scope2: 380, scope3: 1400, total: 2280 },
  { year: 2023, month: 'Jun', scope1: 520, scope2: 400, scope3: 1450, total: 2370 },
  { year: 2023, month: 'Jul', scope1: 510, scope2: 390, scope3: 1500, total: 2400 },
  { year: 2023, month: 'Aug', scope1: 490, scope2: 370, scope3: 1480, total: 2340 },
  { year: 2023, month: 'Sep', scope1: 470, scope2: 350, scope3: 1420, total: 2240 },
  { year: 2023, month: 'Oct', scope1: 460, scope2: 330, scope3: 1380, total: 2170 },
  { year: 2023, month: 'Nov', scope1: 440, scope2: 320, scope3: 1300, total: 2060 },
  { year: 2023, month: 'Dec', scope1: 430, scope2: 310, scope3: 1250, total: 1990 },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'S1', name: 'Alumina Corp', industry: 'Raw Materials', emissions: 12.5, spend: 500000, dependencies: ['S4'], contributionScore: 0 },
  { id: 'S2', name: 'Logistics Pro', industry: 'Transportation', emissions: 8.2, spend: 300000, dependencies: [], contributionScore: 0 },
  { id: 'S3', name: 'PowerGrid Solutions', industry: 'Energy', emissions: 15.0, spend: 200000, dependencies: ['S1'], contributionScore: 0 },
  { id: 'S4', name: 'MineTech', industry: 'Mining', emissions: 22.1, spend: 400000, dependencies: [], contributionScore: 0 },
  { id: 'S5', name: 'PackRight', industry: 'Packaging', emissions: 3.4, spend: 150000, dependencies: ['S2'], contributionScore: 0 },
];

export const ESG_DOC_CONTEXT = `
GHG Protocol Standards Summary:
Scope 1: Direct GHG emissions from sources owned or controlled by the company.
Scope 2: GHG emissions from the generation of purchased electricity, heating and cooling.
Scope 3: Indirect emissions (not included in scope 2) that occur in the value chain, including upstream and downstream.

Target: Net Zero by 2040.
Reduction Strategies: 
- Transition to 100% renewable energy by 2030.
- Electrification of commercial fleet.
- Supplier code of conduct requiring annual emissions reporting.
`;
