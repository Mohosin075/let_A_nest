import { model, Schema } from 'mongoose'
import { ISubscription, SubscriptionModel } from './subscription.interface'

const subscriptionSchema = new Schema<ISubscription, SubscriptionModel>(
  {
    customerId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    plan: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    trxId: {
      type: String,
      required: false,
    },
    subscriptionId: {
      type: String,
      required: true,
    },
    currentPeriodStart: {
      type: String,
      required: true,
    },
    currentPeriodEnd: {
      type: String,
      required: true,
    },

    // Track usage against plan limits
    usage: {
      reelsUsed: { type: Number, default: 0 },
      postsUsed: { type: Number, default: 0 },
      storiesUsed: { type: Number, default: 0 },
      businessesUsed: { type: Number, default: 0 },
      carouselUsed: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['expired', 'active', 'cancel'],
      default: 'active',
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export const Subscription = model<ISubscription, SubscriptionModel>(
  'Subscription',
  subscriptionSchema,
)
