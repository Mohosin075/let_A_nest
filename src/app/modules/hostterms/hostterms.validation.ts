import { z } from 'zod';

const sectionsItemSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export const HosttermsValidations = {
  create: z.object({
    body : z.object({
    hostId: z.string().optional(),
    propertyId: z.string().optional(),
    // isDefault: z.boolean().optional(),
    sections: z.array(sectionsItemSchema),
    lastUpdated: z.string().datetime().optional(),
    })
  }),

  update: z.object({
    body : z.object({
    hostId: z.string().optional(),
    propertyId: z.string().optional(),
    isDefault: z.boolean().optional(),
    sections: z.array(sectionsItemSchema).optional(),
    lastUpdated: z.string().datetime().optional(),
    })
  }),
};
