"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.propertySearchableFields = exports.propertyFilterables = void 0;
// Filterable fields the client can pass in query params
exports.propertyFilterables = [
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
];
// Fields we allow regex/text search on
exports.propertySearchableFields = [
    'title',
    'description',
    'location',
    'postCode',
    'bankDetails',
    'amenities', // string array
];
// Optional util (unchanged)
const isSetEqual = (setA, setB) => {
    if (setA.size !== setB.size)
        return false;
    for (const item of setA)
        if (!setB.has(item))
            return false;
    return true;
};
exports.isSetEqual = isSetEqual;
