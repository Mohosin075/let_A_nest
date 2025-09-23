import { Schema, model } from 'mongoose';
import { IHostterms, HosttermsModel } from './hostterms.interface'; 

const sectionsItemSchema = new Schema({
  title: { type: String },
  content: { type: String },
}, { _id: false });

const hosttermsSchema = new Schema<IHostterms, HosttermsModel>({
  hostId: { type: Schema.Types.ObjectId, ref: 'User' },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
  isDefault: { type: Boolean , default : false},
  // sections: [sectionsItemSchema],
  content : { type: String },
  lastUpdated: { type: Date },
}, {
  timestamps: true
});

export const Hostterms = model<IHostterms, HosttermsModel>('Hostterms', hosttermsSchema);
