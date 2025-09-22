import { Model, Types } from 'mongoose'
import { USER_STATUS } from '../../../enum/user'

export interface IPropertyFilterables {
  searchTerm?: string
  title?: string
  description?: string
  location?: string
  postCode?: string
  bankDetails?: string
}

export enum PROPERTY_STATUS {
  PENDING = 'pending',
  APPROVE = 'approve',
  HOLD = 'hold',
  REJECTED = 'rejected',
  DELETED = 'deleted',
}

export interface IProperty {
  _id: Types.ObjectId
  title: string
  description: string
  location: {
    address: { type: String; required: true }
    geo: {
      type: { type: String; enum: ['Point']; default: 'Point' }
      coordinates: { type: [Number]; required: true }
    }
  }

  postCode: string
  propertyType: string

  details?: {
    maxGuests: number
    bedrooms: number
    bathrooms: number
    priceStartingFrom: number
    availableDateRanges: { from: Date; to: Date }
    amenities: string[]
  }
  coverPhotos: string[]
  photos: string[]
  host: Types.ObjectId

  addressProofDocument?: string
  verifiedAddress?: boolean
  status: PROPERTY_STATUS

  agreedAt: Date
}

export type PropertyModel = Model<IProperty, {}, {}>
