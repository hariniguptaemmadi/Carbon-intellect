
import { Supplier } from '../types';

export const computeSupplierImpact = (suppliers: Supplier[]): Supplier[] => {

  const baseImpacts = suppliers.map(s => ({
    ...s,
    directImpact: s.spend * s.emissions / 1000000 
  }));

  const findSupplier = (id: string) => baseImpacts.find(s => s.id === id);

  return baseImpacts.map(s => {
    let dependencyImpact = 0;
    s.dependencies.forEach(depId => {
      const dep = findSupplier(depId);
      if (dep) {
        dependencyImpact += (dep.spend * dep.emissions / 1000000) * 0.2; 
      }
    });

    return {
      ...s,
      contributionScore: s.directImpact + dependencyImpact
    };
  }).sort((a, b) => b.contributionScore - a.contributionScore);
};
