"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyValidations = exports.LocationValidation = void 0;
const zod_1 = require("zod");
const property_interface_1 = require("./property.interface");
// Re-use the same location validator
exports.LocationValidation = zod_1.z.object({
    address: zod_1.z.string().optional(), // optional for updates
    geo: zod_1.z
        .object({
        type: zod_1.z.literal('Point').optional(),
        coordinates: zod_1.z
            .tuple([zod_1.z.number(), zod_1.z.number()])
            .refine(coords => coords.length === 2, {
            message: 'Coordinates must have [longitude, latitude]',
        })
            .optional(),
    })
        .optional(),
});
exports.PropertyValidations = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            title: zod_1.z.string(),
            description: zod_1.z.string(),
            location: exports.LocationValidation.required(),
            postCode: zod_1.z.string(),
            propertyType: zod_1.z.string(),
            details: zod_1.z
                .object({
                maxGuests: zod_1.z.number().optional(),
                bedrooms: zod_1.z.number().optional(),
                bathrooms: zod_1.z.number().optional(),
                priceStartingFrom: zod_1.z.number().optional(),
                amenities: zod_1.z.array(zod_1.z.string()).optional(),
                availableDateRanges: zod_1.z
                    .object({
                    from: zod_1.z.string().optional(), // ISO date
                    to: zod_1.z.string().optional(),
                })
                    .optional(),
            })
                .optional(),
            coverPhotos: zod_1.z.array(zod_1.z.string()).optional(),
            photos: zod_1.z.array(zod_1.z.string()).optional(),
            host: zod_1.z.string().optional(),
            addressProofDocument: zod_1.z.array(zod_1.z.string()).optional(),
            verifiedAddress: zod_1.z.boolean().optional(),
            agreedTermsAndConditon: zod_1.z.boolean().optional(),
            hostTermsAndCondition: zod_1.z
                .object({
                content: zod_1.z.string(),
            })
                .optional(),
            status: zod_1.z.nativeEnum(property_interface_1.PROPERTY_STATUS).optional(),
            agreedAt: zod_1.z.string().optional(),
        }),
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            title: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            location: exports.LocationValidation.optional(),
            postCode: zod_1.z.string().optional(),
            propertyType: zod_1.z.string().optional(),
            details: zod_1.z
                .object({
                maxGuests: zod_1.z.number().optional(),
                bedrooms: zod_1.z.number().optional(),
                bathrooms: zod_1.z.number().optional(),
                priceStartingFrom: zod_1.z.number().optional(),
                amenities: zod_1.z.array(zod_1.z.string()).optional(),
                availableDateRanges: zod_1.z
                    .object({
                    from: zod_1.z.string().optional(),
                    to: zod_1.z.string().optional(),
                })
                    .optional(),
            })
                .optional(),
            coverPhotos: zod_1.z.array(zod_1.z.string()).optional(),
            photos: zod_1.z.array(zod_1.z.string()).optional(),
            host: zod_1.z.string().optional(),
            addressProofDocument: zod_1.z.array(zod_1.z.string()).optional(),
            agreedTermsAndConditon: zod_1.z.boolean().optional(),
            hostTermsAndCondition: zod_1.z
                .object({
                content: zod_1.z.string(),
            })
                .optional(),
            verifiedAddress: zod_1.z.boolean().optional(),
            status: zod_1.z.nativeEnum(property_interface_1.PROPERTY_STATUS).optional(),
            agreedAt: zod_1.z.string().optional(),
        }),
    }),
};
