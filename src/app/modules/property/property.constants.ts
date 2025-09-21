// Filterable fields for Property
export const propertyFilterables = ['title', 'description', 'location', 'postCode', 'bankDetails'];

// Searchable fields for Property
export const propertySearchableFields = ['title', 'description', 'location', 'postCode', 'bankDetails'];

// Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
};