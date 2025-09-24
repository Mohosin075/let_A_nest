import { Model, Types } from 'mongoose'

export interface SectionsItem {
  title: string
  content: string
}

export interface IHostterms {
  _id: Types.ObjectId
  hostId: Types.ObjectId
  propertyId?: Types.ObjectId
  isDefault?: boolean
  // sections: SectionsItem[];
  content: string
  lastUpdated?: Date
}

export type HosttermsModel = Model<IHostterms, {}, {}>
