"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSetEqual = exports.hosttermsSearchableFields = exports.hosttermsFilterables = void 0;
// Filterable fields for Hostterms
exports.hosttermsFilterables = [];
// Searchable fields for Hostterms
exports.hosttermsSearchableFields = [];
// Helper function for set comparison
const isSetEqual = (setA, setB) => {
    if (setA.size !== setB.size)
        return false;
    for (const item of setA) {
        if (!setB.has(item))
            return false;
    }
    return true;
};
exports.isSetEqual = isSetEqual;
