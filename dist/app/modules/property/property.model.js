"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = void 0;
const mongoose_1 = require("mongoose");
const property_interface_1 = require("./property.interface");
const propertySchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: {
        address: { type: String, required: true },
        geo: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: { type: [Number], required: true }, // [longitude, latitude]
        },
    },
    postCode: { type: String, required: true },
    propertyType: { type: String, required: true },
    details: {
        maxGuests: { type: Number },
        bedrooms: { type: Number },
        bathrooms: { type: Number },
        priceStartingFrom: { type: Number },
        availableDateRanges: {
            from: { type: Date },
            to: { type: Date },
        },
        amenities: { type: [String], default: [] },
    },
    coverPhotos: { type: [String], default: [] },
    photos: { type: [String], default: [] },
    host: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    addressProofDocument: { type: [String], default: [], select: 0 }, // PDF/image for address verification
    verifiedAddress: { type: Boolean, default: false },
    status: {
        type: String,
        enum: Object.values(property_interface_1.PROPERTY_STATUS),
        default: property_interface_1.PROPERTY_STATUS.PENDING,
    },
    hostTermsAndCondition: mongoose_1.Schema.Types.ObjectId,
    agreedTermsAndConditon: { type: Boolean, default: false },
    agreedAt: { type: Date, default: null },
}, {
    timestamps: true, // adds createdAt & updatedAt
});
exports.Property = (0, mongoose_1.model)('Property', propertySchema);
