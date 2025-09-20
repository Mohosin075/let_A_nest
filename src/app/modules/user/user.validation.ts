import { z } from 'zod'
import { USER_ROLES, USER_STATUS } from '../../../enum/user'

// ------------------ SUB-SCHEMAS ------------------
const addressSchema = z.object({
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  permanentAddress: z.string().optional(),
  presentAddress: z.string().optional(),
})

const authenticationSchema = z.object({
  restrictionLeftAt: z.date().nullable().optional(),
  resetPassword: z.boolean().optional(),
  wrongLoginAttempts: z.number().optional(),
  passwordChangedAt: z.date().optional(),
  oneTimeCode: z.string().optional(),
  latestRequestAt: z.date().optional(),
  expiresAt: z.date().optional(),
  requestCount: z.number().optional(),
  authType: z.enum(['createAccount', 'resetPassword']).optional(),
})

const pointSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.tuple([z.number(), z.number()]).optional(), // [longitude, latitude]
})

// ------------------ UPDATE USER VALIDATION ------------------
export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    profile: z.string().url().optional(),
    businessName: z.string().optional(),
    phone: z.string().optional(),
    description: z.string().optional(),

    status: z.nativeEnum(USER_STATUS).optional(),
    verified: z.boolean().optional(),

    address: addressSchema.optional(),
    location: pointSchema.optional(),

    password: z.string().min(6).optional(),
    role: z.nativeEnum(USER_ROLES).optional(),
    appId: z.string().optional(),
    deviceToken: z.string().optional(),

    authentication: authenticationSchema.optional(),
  }),
})
