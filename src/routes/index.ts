import { UserRoutes } from '../app/modules/user/user.route'
import { AuthRoutes } from '../app/modules/auth/auth.route'
import express, { Router } from 'express'
import { NotificationRoutes } from '../app/modules/notifications/notifications.route'
import { PublicRoutes } from '../app/modules/public/public.route'
import { PlanRoutes } from '../app/modules/plan/plan.routes'
import { SubscriptionRoutes } from '../app/modules/subscription/subscription.routes'
import { StatsRoutes } from '../app/modules/stats/stats.route'
import { PropertyRoutes } from '../app/modules/property/property.route'
import { HosttermsRoutes } from '../app/modules/hostterms/hostterms.route'

const router = express.Router()

const apiRoutes: { path: string; route: Router }[] = [
  { path: '/user', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/notifications', route: NotificationRoutes },
  { path: '/public', route: PublicRoutes },
  { path: '/plan', route: PlanRoutes },
  { path: '/subscription', route: SubscriptionRoutes },
  { path: '/stats', route: StatsRoutes },
  { path: '/property', route: PropertyRoutes },
  { path: '/hostterms', route: HosttermsRoutes }]

apiRoutes.forEach(route => {
  router.use(route.path, route.route)
})

export default router
