import { z } from 'zod'
import { PROPERTY_STATUS } from './property.interface'

export const LocationValidation = z.object({
  address: z.string(),
  geo: z.object({
    type: z.literal('Point'), // must be 'Point'
    coordinates: z
      .tuple([z.number(), z.number()]) // [longitude, latitude]
      .refine(coords => coords.length === 2, {
        message: 'Coordinates must have [longitude, latitude]',
      }),
  }),
})

export const PropertyValidations = {
  create: z.object({
    body: z.object({
      title: z.string(),
      description: z.string(),
      location: LocationValidation,
      postCode: z.string(),
      propertyType: z.string(),

      details: z.object({
        maxGuests: z.number(),
        bedrooms: z.number(),
        bathrooms: z.number(),
        priceStartingFrom: z.number(),
        availableDateRanges: z
          .object({
            from: z.string(), // ISO date string
            to: z.string(), // ISO date string
          })
          .optional(),
        amenities: z.array(z.string()),
      }),

      coverPhotos: z.array(z.string()).optional(),
      photos: z.array(z.string()).optional(),

      host: z.string(), // ObjectId as string

      addressProofDocument: z.string().optional(),
      verifiedAddress: z.boolean().optional(),

      status: z.nativeEnum(PROPERTY_STATUS).optional(),
      agreedAt: z.string().optional(), // ISO date string
    }),
  }),

  update: z.object({
    body: z.object({
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
          availableDateRanges: z
            .array(
              z.object({
                from: z.string().optional(),
                to: z.string().optional(),
              }),
            )
            .optional(),
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
  }),
}
