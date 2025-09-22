// Filterable fields for Hostterms
export const hosttermsFilterables = [];

// Searchable fields for Hostterms
export const hosttermsSearchableFields = [];

// Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
};