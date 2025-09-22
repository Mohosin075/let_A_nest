import { z } from 'zod'
import { PROPERTY_STATUS } from './property.interface'

// Re-use the same location validator
export const LocationValidation = z.object({
  address: z.string().optional(), // optional for updates
  geo: z
    .object({
      type: z.literal('Point').optional(),
      coordinates: z
        .tuple([z.number(), z.number()])
        .refine(coords => coords.length === 2, {
          message: 'Coordinates must have [longitude, latitude]',
        })
        .optional(),
    })
    .optional(),
})

export const PropertyValidations = {
  create: z.object({
    body: z.object({
      title: z.string(),
      description: z.string(),
      location: LocationValidation.required(),
      postCode: z.string(),
      propertyType: z.string(),
      details: z
        .object({
          maxGuests: z.number().optional(),
          bedrooms: z.number().optional(),
          bathrooms: z.number().optional(),
          priceStartingFrom: z.number().optional(),
          amenities: z.array(z.string()).optional(),
          availableDateRanges: z
            .object({
              from: z.string().optional(), // ISO date
              to: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
      coverPhotos: z.array(z.string()).optional(),
      photos: z.array(z.string()).optional(),
      host: z.string().optional(),
      addressProofDocument: z.string().optional(),
      verifiedAddress: z.boolean().optional(),
      status: z.nativeEnum(PROPERTY_STATUS).optional(),
      agreedAt: z.string().optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      location: LocationValidation.optional(),
      postCode: z.string().optional(),
      propertyType: z.string().optional(),
      details: z
        .object({
          maxGuests: z.number().optional(),
          bedrooms: z.number().optional(),
          bathrooms: z.number().optional(),
          priceStartingFrom: z.number().optional(),
          amenities: z.array(z.string()).optional(),
          availableDateRanges: z
            .object({
              from: z.string().optional(),
              to: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
      coverPhotos: z.array(z.string()).optional(),
      photos: z.array(z.string()).optional(),
      host: z.string().optional(),
      addressProofDocument: z.string().optional(),
      verifiedAddress: z.boolean().optional(),
      status: z.nativeEnum(PROPERTY_STATUS).optional(),
      agreedAt: z.string().optional(),
    }),
  }),
}
