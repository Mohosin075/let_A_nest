import { z } from 'zod'
import { PROPERTY_STATUS } from './property.interface'

export const PropertyValidations = {
  create: z.object({
    title: z.string(),
    description: z.string(),
    location: z.string(),
    postCode: z.string(),
    propertyType: z.string(),

    details: z.object({
      maxGuests: z.number(),
      bedrooms: z.number(),
      bathrooms: z.number(),
      priceStartingFrom: z.number(),
      availableDates: z.array(z.string()), // store as ISO string
      amenities: z.array(z.string()),
    }),

    coverPhotos: z.array(z.string()).optional(),
    photos: z.array(z.string()).optional(),

    host: z.string(), // ObjectId as string
    stripe: z
      .object({
        accountId: z.string().optional(),
        stripeAccountId: z.boolean().optional(),
      })
      .optional(),

    addressProofDocument: z.string().optional(),
    verifiedAddress: z.boolean().optional(),

    status: z.nativeEnum(PROPERTY_STATUS).optional(),
    agreedAt: z.string().optional(), // ISO date string
  }),

  update: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    postCode: z.string().optional(),
    propertyType: z.string().optional(),

    details: z
      .object({
        maxGuests: z.number().optional(),
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        priceStartingFrom: z.number().optional(),
        availableDates: z.array(z.string()).optional(),
        amenities: z.array(z.string()).optional(),
      })
      .optional(),

    coverPhotos: z.array(z.string()).optional(),
    photos: z.array(z.string()).optional(),

    host: z.string().optional(),
    stripe: z
      .object({
        accountId: z.string().optional(),
        stripeAccountId: z.boolean().optional(),
      })
      .optional(),

    addressProofDocument: z.string().optional(),
    verifiedAddress: z.boolean().optional(),

    status: z.nativeEnum(PROPERTY_STATUS).optional(),
    agreedAt: z.string().optional(),
  }),
}
