import express from 'express'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import { NotificationController } from './notifications.controller'

const router = express.Router()
router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.HOST, USER_ROLES.GUEST),
  NotificationController.getMyNotifications,
)
router.get(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.HOST, USER_ROLES.GUEST),
  NotificationController.updateNotification,
)
router.get(
  '/all',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.HOST, USER_ROLES.GUEST),
  NotificationController.updateAllNotifications,
)
export const NotificationRoutes = router
