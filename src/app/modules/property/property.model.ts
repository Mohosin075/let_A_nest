import { Schema, model } from 'mongoose';
import { IProperty, PropertyModel } from './property.interface'; 

const propertySchema = new Schema<IProperty, PropertyModel>({
  title: { type: String }, 
  description: { type: String }, 
  location: { type: String }, 
  postCode: { type: String }, 
  propertyType: { type: String },
  maxGuests: { type: Number }, 
  bedrooms: { type: Number }, 
  bathrooms: { type: Number }, 
  price: { type: Number }, 
  availableDates: { type: [Date] },
  amenities: { type: [String] },
  photos: { type: [String] },
  host: { type: Schema.Types.ObjectId, ref: 'User' },
  bankDetails: { type: String },
  verifiedAddress: { type: Boolean },
  status: { type: String },
}, {
  timestamps: true
});

export const Property = model<IProperty, PropertyModel>('Property', propertySchema);
