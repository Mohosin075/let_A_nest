import express from 'express'
import { SubscriptionController } from './subscription.controller'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
const router = express.Router()

// router.post(
//   '/create-checkout-session',
//   auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.HOST, USER_ROLES.GUEST),
//   SubscriptionController.createSubscription,
// )

router.get(
  '/',
  auth(
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.HOST,
    USER_ROLES.GUEST,
  ),
  SubscriptionController.subscriptions,
)

router.get(
  '/my-plan',
  auth(
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.HOST,
    USER_ROLES.GUEST,
  ),
  SubscriptionController.subscriptionDetails,
)

export const SubscriptionRoutes = router
