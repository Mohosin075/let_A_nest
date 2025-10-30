"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hostterms = void 0;
const mongoose_1 = require("mongoose");
const sectionsItemSchema = new mongoose_1.Schema({
    title: { type: String },
    content: { type: String },
}, { _id: false });
const hosttermsSchema = new mongoose_1.Schema({
    hostId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    propertyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property' },
    isDefault: { type: Boolean, default: false },
    // sections: [sectionsItemSchema],
    content: { type: String },
    lastUpdated: { type: Date },
}, {
    timestamps: true,
});
exports.Hostterms = (0, mongoose_1.model)('Hostterms', hosttermsSchema);
