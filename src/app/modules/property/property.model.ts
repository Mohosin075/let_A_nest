import { Schema, model, Types, Model } from 'mongoose'
import { USER_STATUS } from '../../../enum/user'
import { IProperty, PROPERTY_STATUS } from './property.interface'

const propertySchema = new Schema<IProperty>(
  {
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
      maxGuests: { type: Number, required: true },
      bedrooms: { type: Number, required: true },
      bathrooms: { type: Number, required: true },
      priceStartingFrom: { type: Number, required: true },
      availableDateRanges: {
        from: { type: Date, required: true },
        to: { type: Date, required: true },
      },

      amenities: { type: [String], default: [] },
    },

    coverPhotos: { type: [String], default: [] },
    photos: { type: [String], default: [] },

    host: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    addressProofDocument: { type: String }, // PDF/image for address verification
    verifiedAddress: { type: Boolean, default: false },

    status: {
      type: String,
      enum: Object.values(PROPERTY_STATUS),
      default: PROPERTY_STATUS.PENDING,
    },

    agreedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
)

export const Property = model<IProperty>(
  'Property',
  propertySchema,
) as Model<IProperty>
