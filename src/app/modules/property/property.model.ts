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

    host: { type: Schema.Types.ObjectId, ref: 'User' },

    addressProofDocument: { type: String }, // PDF/image for address verification
    verifiedAddress: { type: Boolean, default: false },

    status: {
      type: String,
      enum: Object.values(PROPERTY_STATUS),
      default: PROPERTY_STATUS.PENDING,
    },

    hostTermsAndCondition : {
      content : {
        type : String
      }
    },

    agreedTermsAndConditon : {type : Boolean, default : false},
    agreedAt: { type: Date, default: null },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
)

export const Property = model<IProperty>(
  'Property',
  propertySchema,
) as Model<IProperty>
