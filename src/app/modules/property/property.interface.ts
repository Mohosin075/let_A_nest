import { Model, Types } from 'mongoose';

export interface IPropertyFilterables {
  searchTerm?: string;
  title?: string;
  description?: string;
  location?: string;
  postCode?: string;
  bankDetails?: string;
}

export interface IProperty {
  _id: Types.ObjectId;
  title: string;
  description: string;
  location: string;
  postCode: string;
  propertyType: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  price: number;
  availableDates: Date[];
  amenities: string[];
  photos: string[];
  host: Types.ObjectId;
  bankDetails?: string;
  verifiedAddress?: boolean;
  status: string;
}

export type PropertyModel = Model<IProperty, {}, {}>;
