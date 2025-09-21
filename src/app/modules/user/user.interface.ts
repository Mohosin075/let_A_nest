import { Model, Types } from 'mongoose'
import { USER_ROLES, USER_STATUS } from '../../../enum/user'

// ------------------ SUB-TYPES ------------------
export type IAuthentication = {
  restrictionLeftAt: Date | null
  resetPassword: boolean
  wrongLoginAttempts: number
  passwordChangedAt?: Date
  oneTimeCode: string
  latestRequestAt: Date
  expiresAt?: Date
  requestCount?: number
  authType?: 'createAccount' | 'resetPassword'
}

export type IAddress = {
  city?: string
  postalCode?: string
  country?: string
  permanentAddress?: string
  presentAddress?: string
}

export type Point = {
  type: 'Point'
  coordinates: [number, number] // [longitude, latitude]
}

// ------------------ USER TYPE ------------------
export interface IUser {
  _id: Types.ObjectId
  name?: string
  email?: string
  profile?: string
  businessName?: string
  phone?: string
  description?: string

  status: USER_STATUS // standardize statuses
  verified: boolean
  address?: IAddress
  location: Point
  password: string
  role: USER_ROLES
  appId?: string
  deviceToken?: string
  timezone: string
  subscribe: boolean
  // membership: Membership

  authentication: IAuthentication

  stripe?: {
    accountId: string
    stripeAccountId: boolean
  }
  createdAt: Date
  updatedAt: Date
}

// ------------------ MODEL ------------------
export type UserModel = Model<IUser> & {
  isPasswordMatched(
    givenPassword: string,
    savedPassword: string,
  ): Promise<boolean>
}
