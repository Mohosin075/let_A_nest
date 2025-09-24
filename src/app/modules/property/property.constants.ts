// Filterable fields the client can pass in query params
export const propertyFilterables = [
  'title',
  'description',
  'location',
  'postCode',
  'bankDetails',
  'amenities',
  'maxGuests',
  'bedrooms',
  'bathrooms',
  'priceMin',
  'priceMax',
  'propertyType',
  'from',
  'to',
]

// Fields we allow regex/text search on
export const propertySearchableFields = [
  'title',
  'description',
  'location',
  'postCode',
  'bankDetails',
  'amenities', // string array
]

// Optional util (unchanged)
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false
  for (const item of setA) if (!setB.has(item)) return false
  return true
}
