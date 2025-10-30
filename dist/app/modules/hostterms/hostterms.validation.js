"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HosttermsValidations = void 0;
const zod_1 = require("zod");
const sectionsItemSchema = zod_1.z.object({
    title: zod_1.z.string(),
    content: zod_1.z.string(),
});
exports.HosttermsValidations = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            hostId: zod_1.z.string().optional(),
            propertyId: zod_1.z.string().optional(),
            // isDefault: z.boolean().optional(),
            // sections: z.array(sectionsItemSchema),
            content: zod_1.z.string(),
            lastUpdated: zod_1.z.string().datetime().optional(),
        }),
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            hostId: zod_1.z.string().optional(),
            propertyId: zod_1.z.string().optional(),
            isDefault: zod_1.z.boolean().optional(),
            // sections: z.array(sectionsItemSchema).optional(),
            content: zod_1.z.string(),
            lastUpdated: zod_1.z.string().datetime().optional(),
        }),
    }),
};
